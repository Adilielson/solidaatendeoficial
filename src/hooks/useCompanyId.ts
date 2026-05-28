import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCompanyId() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompanyId(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);

      const { data: membership } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.company_id) {
        setCompanyId(membership.company_id);
        setLoading(false);
        return;
      }

      const { data: owned } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

      if (owned?.id) {
        setCompanyId(owned.id);
        setLoading(false);
        return;
      }

      // Se nenhum projeto foi encontrado, apenas define como null.
      // A criação automática agora é tratada apenas pelo trigger no banco de dados.
      setCompanyId(null);
      setLoading(false);
    };

    fetch();
  }, [user]);

  return { companyId, loading };
}
