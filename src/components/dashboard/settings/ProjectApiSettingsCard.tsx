import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Server, Save, Loader2 } from "lucide-react";
import { Company } from "@/hooks/useCompany";

interface ProjectApiSettingsCardProps {
  company: Company;
  canEdit: boolean;
  onUpdate: (patch: any) => Promise<{ error: any }>;
}

export function ProjectApiSettingsCard({ company, canEdit, onUpdate }: ProjectApiSettingsCardProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uazapi_admin_token: company.uazapi_admin_token || "",
    uazapi_server_url: company.uazapi_server_url || "",
  });

  useEffect(() => {
    setFormData({
      uazapi_admin_token: company.uazapi_admin_token || "",
      uazapi_server_url: company.uazapi_server_url || "",
    });
  }, [company.uazapi_admin_token, company.uazapi_server_url]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await onUpdate(formData);
    setLoading(false);

    if (error) {
      toast.error("Erro ao salvar configurações de API");
    } else {
      toast.success("Configurações de API salvas com sucesso");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Configurações de API</CardTitle>
            <CardDescription>
              Configure a URL e o Token da API para integração com o WhatsApp.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api_url">URL do Servidor</Label>
          <div className="relative">
            <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="api_url"
              className="pl-9"
              placeholder="https://sua-instancia.api.com"
              value={formData.uazapi_server_url}
              disabled={!canEdit}
              onChange={(e) => setFormData({ ...formData, uazapi_server_url: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_token">Token da API</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="api_token"
              className="pl-9"
              type="password"
              placeholder="Digite o Token da API"
              value={formData.uazapi_admin_token}
              disabled={!canEdit}
              onChange={(e) => setFormData({ ...formData, uazapi_admin_token: e.target.value })}
            />
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSave} 
          disabled={loading || !canEdit}
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
