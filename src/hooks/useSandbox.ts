import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useTriageFlow } from "@/hooks/useTriageFlow";
import { normalizeAssistantListMessage } from "@/lib/sandboxFormatting";

export type SandboxMode = "strict" | "free";
export type ChatMsg = { role: "user" | "assistant"; content: string; type?: "text" | "audio" };
export type FinalizePayload = {
  status: "qualified" | "discarded" | "transfer";
  reasoning: string;
  answers: { step_id: string; question: string; answer: string }[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
};

export type SandboxSession = {
  id: string;
  mode: SandboxMode;
  messages: ChatMsg[];
  summary: FinalizePayload | null;
  lead_status: "qualified" | "discarded" | "unclassified" | null;
  created_at: string;
};

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/triage-sandbox`;

export function useSandbox() {
  const { user } = useAuth();
  const { companyId } = useCompanyId();
  const { company } = useCompany();
  const { flow, steps } = useTriageFlow();

  const [mode, setMode] = useState<SandboxMode>("strict");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState<FinalizePayload | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<SandboxSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("sandbox_sessions")
      .select("id, mode, messages, summary, lead_status, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory((data ?? []) as unknown as SandboxSession[]);
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchHistory();
  }, [companyId, fetchHistory]);

  const reset = useCallback(() => {
    setMessages([]);
    setSummary(null);
    setSessionId(null);
    setError(null);
  }, []);

  const persistSession = useCallback(
    async (msgs: ChatMsg[], finalSummary: FinalizePayload | null) => {
      if (!companyId || !user) return;

      const payload: any = {
        company_id: companyId,
        user_id: user.id,
        mode,
        messages: msgs,
        summary: finalSummary,
        lead_status:
          finalSummary?.status === "qualified"
            ? "qualified"
            : finalSummary?.status === "discarded"
            ? "discarded"
            : "unclassified",
      };

      if (sessionId) {
        await supabase.from("sandbox_sessions").update(payload).eq("id", sessionId);
      } else {
        const { data } = await supabase
          .from("sandbox_sessions")
          .insert(payload)
          .select("id")
          .single();
        if (data?.id) setSessionId(data.id);
      }
      fetchHistory();
    },
    [companyId, user, mode, sessionId, fetchHistory]
  );

  const send = useCallback(
    async (text: string, type: "text" | "audio" = "text") => {
      if (!text.trim() || streaming || !company) return;
      setError(null);

      const userMsg: ChatMsg = { role: "user", content: text.trim(), type };
      const next = [...messages, userMsg];
      setMessages(next);
      setStreaming(true);

      try {
        const resp = await fetch(FN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: next,
            mode,
            flow_steps: steps,
            company_name: company.name,
            company_id: company.id,
          }),
        });

        if (!resp.ok || !resp.body) {
          const raw = await resp.text().catch(() => "");
          let parsedErr: any = {};
          try { parsedErr = JSON.parse(raw); } catch { /* HTML/empty */ }
          const msg =
            resp.status === 429
              ? "Limite de requisições atingido. Aguarde um instante."
              : resp.status === 402
              ? "Créditos de IA esgotados."
              : parsedErr.error || `Erro ao chamar IA (HTTP ${resp.status})`;
          setError(msg);
          setStreaming(false);
          return;
        }

        const contentType = resp.headers.get("content-type") || "";
        if (!contentType.includes("text/event-stream")) {
          // Not a stream — likely an HTML error page from the gateway
          const raw = await resp.text().catch(() => "");
          let parsedErr: any = {};
          try { parsedErr = JSON.parse(raw); } catch { /* HTML */ }
          setError(parsedErr.error || "Resposta inesperada do servidor. Tente novamente em instantes.");
          setStreaming(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";
        let toolArgsBuffer = "";
        let isToolCall = false;
        let streamDone = false;

        const upsertAssistant = (chunk: string) => {
          assistantContent += chunk;
          const normalizedContent = normalizeAssistantListMessage(assistantContent, steps);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: normalizedContent } : m
              );
            }
            return [...prev, { role: "assistant", content: normalizedContent }];
          });
        };

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, idx);
            textBuffer = textBuffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) upsertAssistant(delta.content);
              if (delta?.tool_calls?.[0]) {
                isToolCall = true;
                const tc = delta.tool_calls[0];
                if (tc.function?.arguments) toolArgsBuffer += tc.function.arguments;
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final messages snapshot
        const normalizedAssistantContent = assistantContent
          ? normalizeAssistantListMessage(assistantContent, steps)
          : "";

        const finalMsgs: ChatMsg[] = normalizedAssistantContent
          ? [...next, { role: "assistant", content: normalizedAssistantContent }]
          : next;

        let finalSummary: FinalizePayload | null = null;
        if (isToolCall && toolArgsBuffer) {
          try {
            finalSummary = JSON.parse(toolArgsBuffer) as FinalizePayload;
            setSummary(finalSummary);
            // Add a closing message in chat if no text was sent
            if (!assistantContent) {
              const closing =
                finalSummary.status === "qualified"
                  ? "✅ Triagem concluída! Vou te encaminhar agora."
                  : finalSummary.status === "discarded"
                  ? "Agradeço seu contato! No momento não conseguimos avançar, mas guardamos seus dados."
                  : "Vou transferir você para um de nossos especialistas humanos. Um momento.";
              setMessages((prev) => [...prev, { role: "assistant", content: closing }]);
              finalMsgs.push({ role: "assistant", content: closing });
            }
          } catch (e) {
            console.error("Failed to parse finalize args", e);
          }
        }

        await persistSession(finalMsgs, finalSummary);
      } catch (e) {
        console.error(e);
        setError("Erro de conexão");
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, company, mode, steps, persistSession]
  );

  const loadSession = useCallback((s: SandboxSession) => {
    setSessionId(s.id);
    setMode(s.mode);
    setMessages(
      (s.messages || []).map((message) =>
        message.role === "assistant"
          ? { ...message, content: normalizeAssistantListMessage(message.content, steps) }
          : message,
      ),
    );
    setSummary(s.summary);
    setError(null);
  }, []);

  const createContactFromSummary = useCallback(async () => {
    if (!summary || !companyId) return null;
    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({
        company_id: companyId,
        name: summary.contact_name || "Lead do Sandbox",
        phone: summary.contact_phone || `sandbox-${Date.now()}`,
        email: summary.contact_email || null,
        lead_status:
          summary.status === "qualified"
            ? "qualified"
            : summary.status === "discarded"
            ? "discarded"
            : "unclassified",
        metadata: { source: "sandbox", session_id: sessionId, answers: summary.answers },
      })
      .select("id")
      .single();
    if (error) return null;
    return contact?.id ?? null;
  }, [summary, companyId, sessionId]);

  return {
    mode,
    setMode,
    messages,
    streaming,
    summary,
    error,
    history,
    flow,
    steps,
    send,
    reset,
    loadSession,
    createContactFromSummary,
    hasFlow: steps.length > 0,
  };
}
