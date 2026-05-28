import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface AiSettings {
  id?: string;
  company_id: string;
  name: string;
  tone: string;
  instructions: string;
}

export function useAiSettings(companyId: string | undefined) {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) return;

    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching AI settings:", error);
      } else if (data) {
        setSettings(data as AiSettings);
      } else {
        // Default settings if none exist
        setSettings({
          company_id: companyId,
          name: "Atendente Virtual",
          tone: "amigável",
          instructions: "",
        });
      }
      setLoading(false);
    }

    fetchSettings();
  }, [companyId]);

  const updateSettings = async (newSettings: Partial<AiSettings>) => {
    if (!companyId) return;

    setLoading(true);
    const payload = {
      ...settings,
      ...newSettings,
      company_id: companyId,
    };

    // Remove ID if it's a new record
    if (!payload.id) {
      const { data, error } = await supabase
        .from("ai_settings")
        .insert([payload])
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSettings(data as AiSettings);
        toast({
          title: "Sucesso",
          description: "Configurações da IA salvas.",
        });
      }
    } else {
      const { data, error } = await supabase
        .from("ai_settings")
        .update(newSettings)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSettings(data as AiSettings);
        toast({
          title: "Sucesso",
          description: "Configurações da IA atualizadas.",
        });
      }
    }
    setLoading(false);
  };

  return { settings, loading, updateSettings };
}
