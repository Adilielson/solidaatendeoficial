import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export type CustomerRow = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  lead_status: string;
  last_contact_at: string | null;
  created_at: string;
  total_purchases: number;
  ltv: number;
};

export type Purchase = {
  id: string;
  contact_id: string;
  product_id: string | null;
  product_name: string;
  amount: number;
  purchase_type: string;
  notes: string | null;
  occurred_at: string;
  created_at: string;
};

export function useCustomers() {
  const { companyId, loading: idLoading } = useCompanyId();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!companyId) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, name, phone, email, lead_status, last_contact_at, created_at")
      .eq("company_id", companyId)
      .not("phone", "like", "sandbox-%")
      .order("last_contact_at", { ascending: false, nullsFirst: false });

    const { data: purchases } = await supabase
      .from("customer_purchases")
      .select("contact_id, amount")
      .eq("company_id", companyId);

    const stats = new Map<string, { count: number; ltv: number }>();
    (purchases ?? []).forEach((p: any) => {
      const cur = stats.get(p.contact_id) ?? { count: 0, ltv: 0 };
      cur.count += 1;
      cur.ltv += Number(p.amount ?? 0);
      stats.set(p.contact_id, cur);
    });

    const rows: CustomerRow[] = (contacts ?? []).map((c: any) => {
      const s = stats.get(c.id) ?? { count: 0, ltv: 0 };
      return { ...c, total_purchases: s.count, ltv: s.ltv };
    });

    setCustomers(rows);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!idLoading) fetchAll();
  }, [idLoading, fetchAll]);

  return { customers, loading: loading || idLoading, refetch: fetchAll, companyId };
}

export function useCustomerPurchases(contactId: string | null) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!contactId) {
      setPurchases([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("customer_purchases")
      .select("*")
      .eq("contact_id", contactId)
      .order("occurred_at", { ascending: false });
    setPurchases((data as Purchase[]) ?? []);
    setLoading(false);
  }, [contactId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (input: {
      company_id: string;
      contact_id: string;
      product_id?: string | null;
      product_name: string;
      amount: number;
      purchase_type?: string;
      notes?: string | null;
      occurred_at?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("customer_purchases").insert({
        ...input,
        purchase_type: input.purchase_type ?? "sale",
        occurred_at: input.occurred_at ?? new Date().toISOString(),
        created_by: user?.id ?? null,
      });
      if (!error) await fetch();
      return { error };
    },
    [fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("customer_purchases").delete().eq("id", id);
      if (!error) await fetch();
      return { error };
    },
    [fetch]
  );

  return { purchases, loading, refetch: fetch, create, remove };
}
