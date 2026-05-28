import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyId } from "@/hooks/useCompanyId";

export type BusinessHourDay = { enabled: boolean; start: string; end: string };
export type BusinessHours = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", BusinessHourDay>;

export type VoiceId = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export type Company = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_id: string;
  business_hours: BusinessHours;
  voice_id: VoiceId;
  voice_enabled: boolean;
  uazapi_admin_token?: string | null;
  uazapi_server_url?: string | null;
  is_super_admin?: boolean;
};

export type CompanyRole = "owner" | "admin" | "agent" | null;

export const DEFAULT_HOURS: BusinessHours = {
  mon: { enabled: true, start: "09:00", end: "18:00" },
  tue: { enabled: true, start: "09:00", end: "18:00" },
  wed: { enabled: true, start: "09:00", end: "18:00" },
  thu: { enabled: true, start: "09:00", end: "18:00" },
  fri: { enabled: true, start: "09:00", end: "18:00" },
  sat: { enabled: false, start: "09:00", end: "13:00" },
  sun: { enabled: false, start: "09:00", end: "13:00" },
};

export function useCompany() {
  const { user } = useAuth();
  const { companyId, loading: idLoading } = useCompanyId();
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<CompanyRole>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!companyId) {
      setCompany(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: c } = await supabase
      .from("companies")
      .select("id, name, slug, logo_url, owner_id, business_hours, voice_id, voice_enabled, uazapi_admin_token, uazapi_server_url")
      .eq("id", companyId)
      .maybeSingle();

    if (c) {
      setCompany({
        ...c,
        business_hours: (c.business_hours as unknown as BusinessHours) ?? DEFAULT_HOURS,
        voice_id: ((c as any).voice_id as VoiceId) ?? "alloy",
        voice_enabled: (c as any).voice_enabled ?? true,
        uazapi_admin_token: (c as any).uazapi_admin_token,
        uazapi_server_url: (c as any).uazapi_server_url,
        is_super_admin: ["solidaatende@gmail.com", "solidadigital01@gmail.com"].includes(user?.email || ""), // Definição manual de Super Admins
      });

      if (user && c.owner_id === user.id) {
        setRole("owner");
      } else if (user) {
        const { data: m } = await supabase
          .from("company_members")
          .select("role")
          .eq("company_id", companyId)
          .eq("user_id", user.id)
          .maybeSingle();
        setRole((m?.role as CompanyRole) ?? null);
      } else {
        setRole(null);
      }
    } else {
      setCompany(null);
      setRole(null);
    }

    setLoading(false);
  }, [companyId, user]);

  useEffect(() => {
    if (idLoading) return;
    fetch();
  }, [idLoading, fetch]);

  const update = useCallback(
    async (patch: Partial<Pick<Company, "name" | "logo_url" | "business_hours" | "voice_id" | "voice_enabled" | "uazapi_admin_token" | "uazapi_server_url">>) => {
      if (!companyId) return { error: new Error("no company") };
      const { error } = await supabase
        .from("companies")
        .update(patch as any)
        .eq("id", companyId);
      if (!error) await fetch();
      return { error };
    },
    [companyId, fetch]
  );

  const remove = useCallback(async () => {
    if (!companyId) return { error: new Error("no company") };
    const { error } = await supabase.from("companies").delete().eq("id", companyId);
    return { error };
  }, [companyId]);

  const isSuperAdmin = ["solidaatende@gmail.com", "solidadigital01@gmail.com", "adilielson@gmail.com"].includes(user?.email || "");
  const finalCompany = company ? { ...company, is_super_admin: isSuperAdmin } : null;

  return {
    company: finalCompany,
    role,
    canEdit: role === "owner" || role === "admin" || isSuperAdmin,
    isOwner: role === "owner" || isSuperAdmin,
    loading: loading || idLoading,
    update,
    remove,
    refetch: fetch,
  };
}
