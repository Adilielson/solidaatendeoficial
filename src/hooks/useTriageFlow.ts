import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeListOptions } from "@/lib/sandboxFormatting";
import { useCompanyId } from "./useCompanyId";

export type FieldType = "text" | "list";
export type ConclusionAction = "transfer" | "schedule" | "discard";

export interface TriageStep {
  id: string;
  flow_id: string;
  question: string;
  field_type: FieldType;
  is_required: boolean;
  options: string[];
  conclusion_action: ConclusionAction | null;
  order_position: number;
}

export interface TriageFlow {
  id: string;
  company_id: string;
  name: string;
  is_active: boolean;
}

export function useTriageFlow() {
  const { companyId, loading: companyLoading } = useCompanyId();
  const [flow, setFlow] = useState<TriageFlow | null>(null);
  const [steps, setSteps] = useState<TriageStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let { data: existing } = await supabase
        .from("triage_flows")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      // Empresas novas já recebem o "Triagem Padrão" via trigger.
      // Esse fallback só dispara se algo deu errado (race / migração antiga).
      if (!existing) {
        const { data: created, error: insErr } = await supabase
          .from("triage_flows")
          .insert({ company_id: companyId, name: "Fluxo principal", is_active: false })
          .select()
          .maybeSingle();
        if (insErr) throw insErr;
        existing = created;
      }

      if (!existing) {
        setFlow(null);
        setSteps([]);
        return;
      }

      setFlow(existing as TriageFlow);

      const { data: stepsData, error: stepsErr } = await supabase
        .from("triage_steps")
        .select("*")
        .eq("flow_id", existing!.id)
        .order("order_position", { ascending: true });
      if (stepsErr) throw stepsErr;

      const normalizedSteps = (stepsData ?? []).map((s: any) => ({
        ...s,
        options:
          s.field_type === "list" && Array.isArray(s.options)
            ? normalizeListOptions(s.options)
            : Array.isArray(s.options)
              ? s.options
              : [],
      }));

      const stepsToPersist = normalizedSteps.filter((s: any, index: number) => {
        const rawOptions = Array.isArray(stepsData?.[index]?.options) ? stepsData[index].options : [];
        return s.field_type === "list" && JSON.stringify(rawOptions) !== JSON.stringify(s.options);
      });

      if (stepsToPersist.length > 0) {
        await Promise.all(
          stepsToPersist.map((step: any) =>
            supabase.from("triage_steps").update({ options: step.options }).eq("id", step.id),
          ),
        );
      }

      setSteps(normalizedSteps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar fluxo");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  const renameFlow = async (name: string) => {
    if (!flow) return;
    const { error } = await supabase.from("triage_flows").update({ name }).eq("id", flow.id);
    if (error) throw error;
    setFlow({ ...flow, name });
  };

  const publish = async () => {
    if (!flow) return;
    const { error } = await supabase
      .from("triage_flows")
      .update({ is_active: true })
      .eq("id", flow.id);
    if (error) throw error;
    setFlow({ ...flow, is_active: true });
  };

  const unpublish = async () => {
    if (!flow) return;
    const { error } = await supabase
      .from("triage_flows")
      .update({ is_active: false })
      .eq("id", flow.id);
    if (error) throw error;
    setFlow({ ...flow, is_active: false });
  };

  const upsertStep = async (
    payload: Omit<TriageStep, "id" | "flow_id" | "order_position"> & { id?: string },
  ) => {
    if (!flow) return;
    const normalizedOptions =
      payload.field_type === "list" ? normalizeListOptions(payload.options) : [];

    if (payload.id) {
      const { error } = await supabase
        .from("triage_steps")
        .update({
          question: payload.question,
          field_type: payload.field_type,
          is_required: payload.is_required,
          options: normalizedOptions,
          conclusion_action: payload.conclusion_action,
        })
        .eq("id", payload.id);
      if (error) throw error;
    } else {
      const nextPos = steps.length;
      const { error } = await supabase.from("triage_steps").insert({
        flow_id: flow.id,
        question: payload.question,
        field_type: payload.field_type,
        is_required: payload.is_required,
        options: normalizedOptions,
        conclusion_action: payload.conclusion_action,
        order_position: nextPos,
      });
      if (error) throw error;
    }
    await load();
  };

  const deleteStep = async (id: string) => {
    const { error } = await supabase.from("triage_steps").delete().eq("id", id);
    if (error) throw error;
    await load();
  };

  const reorderSteps = async (newOrder: TriageStep[]) => {
    setSteps(newOrder.map((s, i) => ({ ...s, order_position: i })));
    await Promise.all(
      newOrder.map((s, i) =>
        supabase.from("triage_steps").update({ order_position: i }).eq("id", s.id),
      ),
    );
  };

  return {
    flow,
    steps,
    loading: loading || companyLoading,
    error,
    reload: load,
    renameFlow,
    publish,
    unpublish,
    upsertStep,
    deleteStep,
    reorderSteps,
  };
}
