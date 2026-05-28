import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export type FollowupSettings = {
  followup_enabled: boolean;
  followup_intervals_hours: number[];
  followup_template_first: string;
  followup_template_second: string;
};

export type FollowupLog = {
  id: string;
  conversation_id: string;
  attempt_number: number;
  template_used: string;
  message: string;
  status: "sent" | "failed" | "blocked" | "invalid_number";
  error: string | null;
  sent_at: string;
};

const DEFAULTS: FollowupSettings = {
  followup_enabled: true,
  followup_intervals_hours: [24, 72],
  followup_template_first:
    "Oi {{nome}}! 👋 Vi que nossa conversa parou. Posso continuar de onde paramos para te ajudar?",
  followup_template_second:
    "Olá {{nome}}, este é nosso último contato. Se ainda tiver interesse, é só me responder por aqui que retomo o atendimento.",
};

export function useFollowupSettings() {
  const { companyId, loading: idLoading } = useCompanyId();
  const [settings, setSettings] = useState<FollowupSettings>(DEFAULTS);
  const [logs, setLogs] = useState<FollowupLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: c } = await supabase
      .from("companies")
      .select(
        "followup_enabled, followup_intervals_hours, followup_template_first, followup_template_second"
      )
      .eq("id", companyId)
      .maybeSingle();

    if (c) {
      setSettings({
        followup_enabled: c.followup_enabled,
        followup_intervals_hours: c.followup_intervals_hours ?? [24, 72],
        followup_template_first: c.followup_template_first,
        followup_template_second: c.followup_template_second,
      });
    }

    const { data: l } = await supabase
      .from("followup_logs")
      .select("id, conversation_id, attempt_number, template_used, message, status, error, sent_at")
      .eq("company_id", companyId)
      .order("sent_at", { ascending: false })
      .limit(50);
    setLogs((l as FollowupLog[]) ?? []);

    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchAll();
  }, [companyId, fetchAll]);

  const update = useCallback(
    async (patch: Partial<FollowupSettings>) => {
      if (!companyId) return { error: new Error("no company") };
      const { error } = await supabase.from("companies").update(patch as any).eq("id", companyId);
      if (!error) await fetchAll();
      return { error };
    },
    [companyId, fetchAll]
  );

  return { settings, logs, loading: loading || idLoading, update, refetch: fetchAll };
}
