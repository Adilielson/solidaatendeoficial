import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Server, Save } from "lucide-react";
import { Company } from "@/hooks/useCompany";

interface AdminApiSettingsCardProps {
  company: Company;
  onUpdate: (patch: any) => Promise<{ error: any }>;
}

export function AdminApiSettingsCard({ company, onUpdate }: AdminApiSettingsCardProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uazapi_admin_token: company.uazapi_admin_token || "",
    uazapi_server_url: company.uazapi_server_url || "",
  });

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
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Configurações Globais UazAPI (Admin)</CardTitle>
            <CardDescription>
              Defina o Admin Token e a URL do servidor que serão usados para gerenciar as instâncias.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin_token">Admin Token Global</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin_token"
              className="pl-9"
              placeholder="Digite o Admin Token da UazAPI"
              value={formData.uazapi_admin_token}
              onChange={(e) => setFormData({ ...formData, uazapi_admin_token: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server_url">Server URL Base</Label>
          <div className="relative">
            <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="server_url"
              className="pl-9"
              placeholder="https://sua-instancia.uazapi.com"
              value={formData.uazapi_server_url}
              onChange={(e) => setFormData({ ...formData, uazapi_server_url: e.target.value })}
            />
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Configurações de Admin"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
