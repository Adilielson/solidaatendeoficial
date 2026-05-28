import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export type Product = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  is_active?: boolean;
};

export function useProducts() {
  const { companyId, loading: idLoading } = useCompanyId();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!idLoading) fetch();
  }, [idLoading, fetch]);

  const create = useCallback(
    async (input: ProductInput) => {
      if (!companyId) return { error: new Error("no company"), data: null };
      const { data, error } = await supabase
        .from("products")
        .insert({ ...input, company_id: companyId })
        .select()
        .single();
      if (!error) await fetch();
      return { data, error };
    },
    [companyId, fetch]
  );

  const update = useCallback(
    async (id: string, patch: Partial<ProductInput>) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (!error) await fetch();
      return { error };
    },
    [fetch]
  );

  const duplicate = useCallback(
    async (id: string) => {
      if (!companyId) return { error: new Error("no company"), data: null };
      const original = products.find((p) => p.id === id);
      if (!original) return { error: new Error("not found"), data: null };
      const { data, error } = await supabase
        .from("products")
        .insert({
          company_id: companyId,
          name: `${original.name} (cópia)`,
          description: original.description,
          price: original.price,
          image_url: original.image_url,
          is_active: original.is_active,
        })
        .select()
        .single();
      if (!error) await fetch();
      return { data, error };
    },
    [companyId, products, fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) await fetch();
      return { error };
    },
    [fetch]
  );

  const uploadImage = useCallback(
    async (file: File): Promise<{ url: string | null; error: Error | null }> => {
      if (!companyId) return { url: null, error: new Error("no company") };
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) return { url: null, error: upErr };
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    },
    [companyId]
  );

  return {
    products,
    loading: loading || idLoading,
    refetch: fetch,
    create,
    update,
    remove,
    duplicate,
    uploadImage,
  };
}
