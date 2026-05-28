import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export function useAiGlobal() {
  const { companyId, loading: companyLoading } = useCompanyId();
  const [aiGlobalEnabled, setAiGlobalEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("companies")
        .select("ai_global_enabled")
        .eq("id", companyId)
        .maybeSingle();

      if (data) setAiGlobalEnabled(data.ai_global_enabled);
      setLoading(false);
    };

    fetch();
  }, [companyId]);

  const toggle = useCallback(async (value: boolean) => {
    if (!companyId) return;
    setAiGlobalEnabled(value);
    await supabase
      .from("companies")
      .update({ ai_global_enabled: value })
      .eq("id", companyId);
  }, [companyId]);

  return { aiGlobalEnabled, toggle, loading: loading || companyLoading };
}
