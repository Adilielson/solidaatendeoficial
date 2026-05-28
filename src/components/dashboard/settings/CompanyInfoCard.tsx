import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Projector, Sparkles, Key, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Company } from "@/hooks/useCompany";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome deve ter até 80 caracteres"),
});

type Props = {
  company: Company;
  canEdit: boolean;
  onUpdate: (patch: Partial<Pick<Company, "name" | "logo_url" | "uazapi_admin_token" | "uazapi_server_url">>) => Promise<{ error: any }>;
};

export function CompanyInfoCard({ company, canEdit, onUpdate }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState(company.name);
  const [apiUrl, setApiUrl] = useState(company.uazapi_server_url || "");
  const [apiToken, setApiToken] = useState(company.uazapi_admin_token || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const emailPrefix = user?.email?.split("@")[0]?.toLowerCase() ?? "";
  const isDefaultName =
    !!emailPrefix && company.name.toLowerCase() === emailPrefix;
  const needsSetup = isDefaultName || !company.logo_url;

  const dirty = 
    name.trim() !== company.name || 
    apiUrl.trim() !== (company.uazapi_server_url || "") || 
    apiToken.trim() !== (company.uazapi_admin_token || "");

  const handleSave = async () => {
    const parsed = schema.safeParse({ name });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await onUpdate({ 
      name: parsed.data.name,
      uazapi_server_url: apiUrl,
      uazapi_admin_token: apiToken
    });
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Dados atualizados");
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${company.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("company-logos")
      .upload(path, file, { upsert: true });

    if (upErr) {
      toast.error("Erro ao enviar logo");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    const { error } = await onUpdate({ logo_url: data.publicUrl });
    setUploading(false);

    if (error) toast.error("Erro ao salvar logo");
    else toast.success("Logo atualizado");
  };

  const initials = company.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={needsSetup ? "border-primary/40 ring-1 ring-primary/20" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Projector className="h-5 w-5 text-primary" />
          Perfil do Projeto
          {needsSetup && (
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px] gap-1">
              <Sparkles className="h-3 w-3" />
              Comece por aqui
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {canEdit
            ? needsSetup
              ? "Personalize o nome real e envie o logotipo do seu projeto para o sistema ficar com a sua cara."
              : "Informações básicas do seu projeto"
            : "Apenas administradores podem editar"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className={`h-20 w-20 ${!company.logo_url ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""}`}>
            <AvatarImage src={company.logo_url ?? undefined} alt={company.name} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!canEdit || uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {company.logo_url ? "Trocar logo" : "Enviar logo"}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP. Máx 2MB.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-name">Nome do projeto</Label>
          <Input
            id="company-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            maxLength={80}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL do Servidor (UazAPI)</Label>
            <div className="relative">
              <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="api-url"
                className="pl-9"
                placeholder="https://sua-instancia.uazapi.com"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-token">Token da API</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="api-token"
                className="pl-9"
                type="password"
                placeholder="Digite o Token da API"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!canEdit || !dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
