// Followup cron — runs hourly. Sends 1st/2nd reminder to silent leads in triage.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type Company = {
  id: string;
  name: string;
  followup_enabled: boolean;
  followup_intervals_hours: number[];
  followup_template_first: string;
  followup_template_second: string;
};

type Conversation = {
  id: string;
  company_id: string;
  contact_id: string;
  followup_count: number;
  last_followup_at: string | null;
  last_message_at: string | null;
  whatsapp_instance_id: string | null;
};

async function generateAiFollowup(
  supabase: any,
  conversationId: string,
  contactName: string,
  companyName: string,
  companyId: string,
): Promise<string | null> {
  // 1. Fetch AI Settings
  let aiName = "Atendente Virtual";
  let aiTone = "amigável";
  let aiInstructions = "";

  const { data: aiSettings } = await supabase
    .from("ai_settings")
    .select("name, tone, instructions")
    .eq("company_id", companyId)
    .maybeSingle();

  if (aiSettings) {
    aiName = aiSettings.name || aiName;
    aiTone = aiSettings.tone || aiTone;
    aiInstructions = aiSettings.instructions || "";
  }

  // 2. Fetch Products
  let productsText = "";
  const { data: products } = await supabase
    .from("products")
    .select("name, description, price")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (products && products.length > 0) {
    productsText = "\n\nNOSSO CATÁLOGO DE PRODUTOS/SERVIÇOS:\n" + 
      products.map((p: any) => `- ${p.name}: ${p.description || "Sem descrição"}. Preço: R$ ${p.price}`).join("\n");
  }

  const { data: msgs } = await supabase

    .from("messages")
    .select("direction, content, is_from_bot")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const transcript = (msgs ?? [])
    .map((m: any) => `${m.direction === "inbound" ? "Lead" : "Atendente"}: ${m.content ?? ""}`)
    .join("\n");

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é ${aiName}, um agente de atendimento com tom ${aiTone} da empresa "${companyName}". 
${aiInstructions ? `INSTRUÇÕES ADICIONAIS:\n${aiInstructions}\n` : ""}
${productsText}

Gere UMA mensagem curta de follow-up em português brasileiro (1-2 frases, tom ${aiTone}) para reengajar um lead que parou de responder. Esta é a ÚLTIMA tentativa, então deixe claro que é o último contato sem ser agressivo. Não use saudações como "bom dia". Use o nome do lead se fizer sentido.`,
          },

          {
            role: "user",
            content: `Lead: ${contactName || "(sem nome)"}\nHistórico:\n${transcript || "(vazio)"}\n\nGere a mensagem de follow-up final.`,
          },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (e) {
    console.error("AI followup error", e);
    return null;
  }
}

async function sendWhatsApp(
  serverUrl: string,
  token: string,
  phone: string,
  message: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const r = await fetch(`${serverUrl.replace(/\/$/, "")}/send/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({ number: phone, text: message }),
    });
    if (r.ok) return { ok: true, status: r.status };
    const text = await r.text();
    return { ok: false, status: r.status, error: text.slice(0, 500) };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "network error" };
  }
}

function classifyError(status: number, err: string | undefined): "blocked" | "invalid_number" | "failed" {
  const s = (err || "").toLowerCase();
  if (s.includes("not exists") || s.includes("invalid") || s.includes("not a whatsapp") || status === 404) {
    return "invalid_number";
  }
  if (s.includes("block") || s.includes("forbidden") || status === 403) return "blocked";
  return "failed";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const summary = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  try {
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, followup_enabled, followup_intervals_hours, followup_template_first, followup_template_second")
      .eq("followup_enabled", true);

    for (const c of (companies ?? []) as Company[]) {
      const intervals = c.followup_intervals_hours?.length ? c.followup_intervals_hours : [24, 72];
      const maxAttempts = Math.min(intervals.length, 2);

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, company_id, contact_id, followup_count, last_followup_at, last_message_at, whatsapp_instance_id")
        .eq("company_id", c.id)
        .eq("status", "open")
        .eq("followup_status", "active")
        .lt("followup_count", maxAttempts);

      for (const conv of (convs ?? []) as Conversation[]) {
        summary.processed++;

        const nextAttempt = conv.followup_count + 1; // 1 or 2
        const requiredHours = intervals[conv.followup_count] ?? 24;

        // Reference time: last_followup_at if any, else last_message_at
        const refTimeStr = conv.last_followup_at ?? conv.last_message_at;
        if (!refTimeStr) { summary.skipped++; continue; }
        const refTime = new Date(refTimeStr).getTime();
        const hoursElapsed = (Date.now() - refTime) / 3_600_000;
        if (hoursElapsed < requiredHours) { summary.skipped++; continue; }

        // Verify last message is from us (bot/agent), not from lead — i.e., lead silent
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("direction")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!lastMsg || lastMsg.direction !== "outbound") { summary.skipped++; continue; }

        // Verify triage in progress: at least 1 inbound msg exists (lead engaged), not yet finalized
        // (we treat finalized convs as either status != open or assigned_to set)
        const { count: inboundCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("direction", "inbound");
        if (!inboundCount || inboundCount < 1) { summary.skipped++; continue; }

        // Get contact + whatsapp instance
        const { data: contact } = await supabase
          .from("contacts").select("name, phone").eq("id", conv.contact_id).maybeSingle();
        if (!contact?.phone) { summary.skipped++; continue; }

        let instance: any = null;
        if (conv.whatsapp_instance_id) {
          const { data } = await supabase
            .from("whatsapp_instances")
            .select("server_url, instance_token, is_connected")
            .eq("id", conv.whatsapp_instance_id).maybeSingle();
          instance = data;
        } else {
          const { data } = await supabase
            .from("whatsapp_instances")
            .select("server_url, instance_token, is_connected")
            .eq("company_id", c.id)
            .eq("is_connected", true).limit(1).maybeSingle();
          instance = data;
        }
        if (!instance?.server_url || !instance?.instance_token || !instance?.is_connected) {
          summary.skipped++; continue;
        }

        // Build message: 1st = template, 2nd = AI
        const name = contact.name?.split(" ")[0] || "";
        let templateUsed: "fixed" | "ai" = "fixed";
        let message = "";

        if (nextAttempt === 1) {
          message = c.followup_template_first
            .replaceAll("{{nome}}", name)
            .replaceAll("{{empresa}}", c.name);
        } else {
          const ai = await generateAiFollowup(supabase, conv.id, name, c.name, c.id);
          if (ai) {
            templateUsed = "ai";
            message = ai;
          } else {
            // fallback to second template
            message = c.followup_template_second
              .replaceAll("{{nome}}", name)
              .replaceAll("{{empresa}}", c.name);
          }
        }

        const send = await sendWhatsApp(instance.server_url, instance.instance_token, contact.phone, message);

        if (send.ok) {
          summary.sent++;
          await supabase.from("followup_logs").insert({
            company_id: c.id,
            conversation_id: conv.id,
            attempt_number: nextAttempt,
            template_used: templateUsed,
            message,
            status: "sent",
          });
          await supabase.from("messages").insert({
            conversation_id: conv.id,
            direction: "outbound",
            content: message,
            is_from_bot: true,
          });
          const updates: any = {
            followup_count: nextAttempt,
            last_followup_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          };
          if (nextAttempt >= maxAttempts) updates.followup_status = "exhausted";
          await supabase.from("conversations").update(updates).eq("id", conv.id);
        } else {
          summary.failed++;
          const errStatus = classifyError(send.status, send.error);
          await supabase.from("followup_logs").insert({
            company_id: c.id,
            conversation_id: conv.id,
            attempt_number: nextAttempt,
            template_used: templateUsed,
            message,
            status: errStatus,
            error: send.error?.slice(0, 500) ?? null,
          });
          // Hard-fail conversations on blocked/invalid; soft-retry on generic failed
          if (errStatus === "blocked" || errStatus === "invalid_number") {
            await supabase.from("conversations").update({ followup_status: "failed" }).eq("id", conv.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("followup-cron error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
