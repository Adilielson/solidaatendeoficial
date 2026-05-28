import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot, BotOff, Search, User, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useAiGlobal } from "@/hooks/useAiGlobal";
import type { Tables } from "@/integrations/supabase/types";

type Conversation = Tables<"conversations"> & {
  contacts: { name: string | null; phone: string } | null;
  assigned_profile: { full_name: string | null } | null;
};

type Message = Tables<"messages"> & {
  sender: { full_name: string | null } | null;
};

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  closed: "Fechada",
};

const DashboardConversations = () => {
  const { companyId, loading: companyLoading } = useCompanyId();
  const { aiGlobalEnabled } = useAiGlobal();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [members, setMembers] = useState<{ id: string; full_name: string | null }[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "closed">("all");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("*, contacts(name, phone), assigned_profile:profiles!conversations_assigned_to_fkey(full_name)")
      .eq("company_id", companyId)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  }, [companyId]);

  const fetchMembers = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("company_members")
      .select("user_id, profiles:profiles!company_members_user_id_fkey(full_name)")
      .eq("company_id", companyId);
    if (data) {
      setMembers(data.map((m: any) => ({ id: m.user_id, full_name: m.profiles?.full_name ?? null })));
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchConversations();
      fetchMembers();
    }
  }, [companyId, fetchConversations, fetchMembers]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    const fetchMessages = async () => {
      setMessagesLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(full_name)")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      setMessagesLoading(false);
    };
    fetchMessages();
  }, [selectedId]);

  const handleStatusChange = async (convId: string, newStatus: string) => {
    await supabase.from("conversations").update({ status: newStatus as any }).eq("id", convId);
    fetchConversations();
  };

  const handleAssign = async (convId: string, userId: string) => {
    await supabase.from("conversations").update({ assigned_to: userId === "none" ? null : userId }).eq("id", convId);
    fetchConversations();
  };

  const handleToggleAi = async (convId: string, value: boolean) => {
    await supabase.from("conversations").update({ ai_enabled: value }).eq("id", convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, ai_enabled: value } : c))
    );
  };

  const filtered = conversations.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    const contactName = c.contacts?.name ?? c.contacts?.phone ?? "";
    if (search && !contactName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = conversations.find((c) => c.id === selectedId);

  const isAiActive = (conv: Conversation) => aiGlobalEnabled && conv.ai_enabled;

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por contato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {(["all", "open", "pending", "closed"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" className="text-xs h-7 flex-1" onClick={() => setFilter(f)}>
                {f === "all" ? "Todas" : statusLabels[f]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Nenhuma conversa encontrada</div>
          ) : (
            filtered.map((conv) => {
              const contactName = conv.contacts?.name ?? conv.contacts?.phone ?? "Desconhecido";
              const timeStr = conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : "";
              const aiActive = isAiActive(conv);

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-3 border-b border-border hover:bg-muted/30 transition-colors ${selectedId === conv.id ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{contactName}</span>
                    <div className="flex items-center gap-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {aiActive ? (
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <BotOff className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {aiActive ? "IA ativa" : !aiGlobalEnabled ? "IA pausada globalmente" : "IA pausada nesta conversa"}
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-xs text-muted-foreground">{timeStr}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate pr-2">{conv.subject ?? "Sem assunto"}</p>
                    <Badge variant="outline" className={`${statusColors[conv.status]} text-[10px] px-1.5 py-0`}>
                      {statusLabels[conv.status]}
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-3 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-medium shrink-0">
                {(selected.contacts?.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selected.contacts?.name ?? selected.contacts?.phone ?? "Desconhecido"}
                </p>
                <p className="text-xs text-muted-foreground">{selected.contacts?.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* AI toggle per conversation */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border">
                    {isAiActive(selected) ? (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <BotOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <Switch
                      checked={selected.ai_enabled}
                      onCheckedChange={(v) => handleToggleAi(selected.id, v)}
                      disabled={!aiGlobalEnabled}
                      className="scale-75"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {!aiGlobalEnabled
                    ? "IA pausada globalmente — ative na sidebar"
                    : selected.ai_enabled
                    ? "IA ativa nesta conversa"
                    : "IA pausada nesta conversa"}
                </TooltipContent>
              </Tooltip>

              {/* Status */}
              <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v)}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="closed">Fechada</SelectItem>
                </SelectContent>
              </Select>

              {/* Assign */}
              <Select value={selected.assigned_to ?? "none"} onValueChange={(v) => handleAssign(selected.id, v)}>
                <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Atribuir..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não atribuído</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name ?? "Sem nome"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Nenhuma mensagem nesta conversa
              </div>
            ) : (
              messages.map((msg) => {
                const isInbound = msg.direction === "inbound";
                const isBot = msg.is_from_bot;
                return (
                  <div key={msg.id} className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isInbound ? "bg-secondary" : isBot ? "bg-primary/10" : "bg-accent/20"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isBot && <Bot className="h-3 w-3 text-primary" />}
                        {!isInbound && !isBot && <User className="h-3 w-3 text-accent-foreground" />}
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {isInbound ? "Contato" : isBot ? "IA" : msg.sender?.full_name ?? "Atendente"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{msg.content}</p>
                      {msg.media_url && (
                        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block">
                          📎 {msg.media_type ?? "Mídia"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Read-only footer */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input placeholder="Somente leitura — histórico de conversas" className="flex-1" disabled />
              <Button disabled>Enviar</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Selecione uma conversa</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardConversations;
