import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DailyMessages } from "@/components/dashboard/overview/MessagesBarChart";
import type { RecentConversation } from "@/components/dashboard/overview/RecentConversations";

export type DashboardPeriod = { from: Date; to: Date; label: string };

export type LeadMetrics = { qualified: number; discarded: number; unclassified: number; total: number };
export type ConvMetrics = { open: number; pending: number; closed: number };
export type FollowupMetrics = {
  sent: number;
  reengaged: number;
  reengagementRate: number;
  failed: number;
  exhausted: number;
};
export type TriageFunnel = {
  started: number;
  responded: number;
  completed: number;
  qualified: number;
  discarded: number;
};
export type AiSplit = { ai: number; human: number; aiPct: number };
export type WhatsAppSnapshot = {
  connected: boolean;
  phone: string | null;
  lastConnectionAt: string | null;
  status: "connected" | "disconnected" | "pending";
} | null;

const buildBuckets = (from: Date, to: Date): DailyMessages[] => {
  const buckets: DailyMessages[] = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  const cur = new Date(start);
  while (cur <= end) {
    buckets.push({
      day: `${cur.getDate().toString().padStart(2, "0")}/${(cur.getMonth() + 1).toString().padStart(2, "0")}`,
      inbound: 0,
      outbound: 0,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return buckets;
};

export function useDashboardData(companyId: string | null, period: DashboardPeriod) {
  const [loading, setLoading] = useState(true);
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics>({ qualified: 0, discarded: 0, unclassified: 0, total: 0 });
  const [convMetrics, setConvMetrics] = useState<ConvMetrics>({ open: 0, pending: 0, closed: 0 });
  const [messagesData, setMessagesData] = useState<DailyMessages[]>([]);
  const [recent, setRecent] = useState<RecentConversation[]>([]);
  const [followup, setFollowup] = useState<FollowupMetrics>({ sent: 0, reengaged: 0, reengagementRate: 0, failed: 0, exhausted: 0 });
  const [funnel, setFunnel] = useState<TriageFunnel>({ started: 0, responded: 0, completed: 0, qualified: 0, discarded: 0 });
  const [aiSplit, setAiSplit] = useState<AiSplit>({ ai: 0, human: 0, aiPct: 0 });
  const [whatsapp, setWhatsapp] = useState<WhatsAppSnapshot>(null);

  const refetchTimer = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const fromIso = period.from.toISOString();
    const toIso = period.to.toISOString();

    const [contactsRes, allConvRes, periodConvRes, recentRes, followupLogsRes, waRes] = await Promise.all([
      supabase.from("contacts").select("lead_status").eq("company_id", companyId),
      supabase.from("conversations").select("id, status").eq("company_id", companyId),
      supabase
        .from("conversations")
        .select("id, created_at, triage_completed_at, last_followup_at, followup_count, followup_status, contact_id, contacts(lead_status)")
        .eq("company_id", companyId)
        .gte("created_at", fromIso)
        .lte("created_at", toIso),
      supabase
        .from("conversations")
        .select("id, status, last_message_at, ai_enabled, contacts(name, phone)")
        .eq("company_id", companyId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(5),
      supabase
        .from("followup_logs")
        .select("conversation_id, status, sent_at")
        .eq("company_id", companyId)
        .gte("sent_at", fromIso)
        .lte("sent_at", toIso),
      supabase
        .from("whatsapp_instances")
        .select("status, is_connected, phone_number, last_connection_at")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // Leads (sempre acumulado, não depende de período)
    if (contactsRes.data) {
      const qualified = contactsRes.data.filter((c) => c.lead_status === "qualified").length;
      const discarded = contactsRes.data.filter((c) => c.lead_status === "discarded").length;
      const unclassified = contactsRes.data.filter((c) => c.lead_status === "unclassified").length;
      setLeadMetrics({ qualified, discarded, unclassified, total: contactsRes.data.length });
    }

    // Status de conversas (estado atual)
    if (allConvRes.data) {
      setConvMetrics({
        open: allConvRes.data.filter((c) => c.status === "open").length,
        pending: allConvRes.data.filter((c) => c.status === "pending").length,
        closed: allConvRes.data.filter((c) => c.status === "closed").length,
      });
    }

    // Mensagens no período
    const allConvIds = (allConvRes.data ?? []).map((c) => c.id);
    let inboundConvIds = new Set<string>();
    let buckets = buildBuckets(period.from, period.to);
    let aiCount = 0, humanCount = 0;

    if (allConvIds.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("created_at, direction, is_from_bot, conversation_id")
        .in("conversation_id", allConvIds)
        .gte("created_at", fromIso)
        .lte("created_at", toIso);

      if (msgs) {
        const startMs = new Date(period.from); startMs.setHours(0, 0, 0, 0);
        msgs.forEach((m) => {
          const d = new Date(m.created_at); d.setHours(0, 0, 0, 0);
          const idx = Math.floor((d.getTime() - startMs.getTime()) / (1000 * 60 * 60 * 24));
          if (idx >= 0 && idx < buckets.length) {
            if (m.direction === "inbound") {
              buckets[idx].inbound++;
              inboundConvIds.add(m.conversation_id);
            } else {
              buckets[idx].outbound++;
              if (m.is_from_bot) aiCount++; else humanCount++;
            }
          }
        });
      }
    }
    setMessagesData(buckets);
    const totalOut = aiCount + humanCount;
    setAiSplit({ ai: aiCount, human: humanCount, aiPct: totalOut > 0 ? Math.round((aiCount / totalOut) * 100) : 0 });

    // Funil de triagem (baseado em conversas iniciadas no período)
    const periodConv = periodConvRes.data ?? [];
    const started = periodConv.length;
    const respondedSet = new Set<string>();
    if (started > 0) {
      const { data: inboundMsgs } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", periodConv.map((c) => c.id))
        .eq("direction", "inbound");
      (inboundMsgs ?? []).forEach((m) => respondedSet.add(m.conversation_id));
    }
    const completed = periodConv.filter((c) => c.triage_completed_at != null).length;
    const qualified = periodConv.filter((c: any) => c.contacts?.lead_status === "qualified").length;
    const discarded = periodConv.filter((c: any) => c.contacts?.lead_status === "discarded").length;
    setFunnel({ started, responded: respondedSet.size, completed, qualified, discarded });

    // Follow-up
    const logs = followupLogsRes.data ?? [];
    const sent = logs.filter((l) => l.status === "sent").length;
    const failed = logs.filter((l) => l.status === "failed" || l.status === "blocked" || l.status === "invalid_number").length;
    const exhausted = periodConv.filter((c: any) => c.followup_status === "exhausted").length;

    // Reengajamento: conversas que receberam follow-up "sent" no período E tiveram inbound APÓS o último follow-up
    const sentByConv = new Map<string, string>(); // conv_id -> latest sent_at
    logs.filter((l) => l.status === "sent").forEach((l) => {
      const prev = sentByConv.get(l.conversation_id);
      if (!prev || new Date(l.sent_at) > new Date(prev)) sentByConv.set(l.conversation_id, l.sent_at);
    });
    let reengaged = 0;
    if (sentByConv.size > 0) {
      const convIds = Array.from(sentByConv.keys());
      const { data: postMsgs } = await supabase
        .from("messages")
        .select("conversation_id, created_at")
        .in("conversation_id", convIds)
        .eq("direction", "inbound");
      const repliedSet = new Set<string>();
      (postMsgs ?? []).forEach((m) => {
        const sentAt = sentByConv.get(m.conversation_id);
        if (sentAt && new Date(m.created_at) > new Date(sentAt)) repliedSet.add(m.conversation_id);
      });
      reengaged = repliedSet.size;
    }
    const reengagementRate = sentByConv.size > 0 ? Math.round((reengaged / sentByConv.size) * 100) : 0;
    setFollowup({ sent, reengaged, reengagementRate, failed, exhausted });

    // Recent conversations
    if (recentRes.data) {
      setRecent(
        recentRes.data.map((c: any) => ({
          id: c.id,
          contactName: c.contacts?.name ?? null,
          contactPhone: c.contacts?.phone ?? "—",
          status: c.status,
          lastMessageAt: c.last_message_at,
          aiEnabled: c.ai_enabled,
        })),
      );
    }

    // WhatsApp
    if (waRes.data) {
      setWhatsapp({
        connected: waRes.data.is_connected,
        phone: waRes.data.phone_number,
        lastConnectionAt: waRes.data.last_connection_at,
        status: waRes.data.status,
      });
    } else {
      setWhatsapp(null);
    }

    setLoading(false);
  }, [companyId, period.from, period.to]);

  const debouncedRefetch = useCallback(() => {
    if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => fetchAll(), 500);
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime: messages + conversations
  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`dashboard:${companyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => debouncedRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${companyId}` }, () => debouncedRefetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    };
  }, [companyId, debouncedRefetch]);

  return { loading, leadMetrics, convMetrics, messagesData, recent, followup, funnel, aiSplit, whatsapp, refetch: fetchAll };
}
