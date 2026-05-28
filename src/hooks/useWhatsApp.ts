import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface WhatsAppInstance {
  id: string;
  company_id: string;
  instance_name: string;
  server_url: string | null;
  webhook_url: string | null;
  status: "connected" | "disconnected" | "pending";
  is_connected: boolean;
  last_connection_at: string | null;
  phone_number: string | null;
}

type Action = "get-or-create" | "qrcode" | "disconnect";

async function callManage<T = any>(action: Action, companyId?: string | null): Promise<T> {
  const { data, error } = await supabase.functions.invoke("whatsapp-manage", {
    body: { action, companyId },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export function useWhatsApp() {
  const { companyId } = useCompanyId();
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchQrCode = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await callManage<{ connected: boolean; qrcode: string }>("qrcode", companyId);
      setQrCode(res.qrcode || "");
      if (res.connected) {
        setInstance((prev) => (prev ? { ...prev, is_connected: true, status: "connected" } : prev));
        stopPolling();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar QR Code");
    }
  }, [stopPolling, companyId]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = window.setInterval(fetchQrCode, 8000);
  }, [fetchQrCode, stopPolling]);

  const loadInstance = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callManage<{ instance: WhatsAppInstance }>("get-or-create", companyId);
      setInstance(res.instance);
      if (!res.instance.is_connected) {
        await fetchQrCode();
        startPolling();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar instância");
    } finally {
      setLoading(false);
    }
  }, [fetchQrCode, startPolling, companyId]);

  const disconnect = useCallback(async () => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      await callManage("disconnect", companyId);
      await loadInstance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao desconectar");
    } finally {
      setActionLoading(false);
    }
  }, [loadInstance, companyId]);

  const refreshQr = useCallback(async () => {
    setActionLoading(true);
    await fetchQrCode();
    setActionLoading(false);
  }, [fetchQrCode]);

  useEffect(() => {
    if (companyId) loadInstance();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return { instance, qrCode, loading, actionLoading, error, loadInstance, refreshQr, disconnect };
}
