import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Key, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function UserProfileCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string;
    avatar_url: string;
  }>({
    full_name: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso");
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login?type=recovery`,
    });

    if (error) {
      toast.error("Erro ao enviar email de recuperação");
    } else {
      toast.success("Email de recuperação enviado!");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e como você aparece para o time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie sua senha e acesso à conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Alterar Senha</p>
              <p className="text-xs text-muted-foreground">
                Enviaremos um link para o seu email para redefinir sua senha.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetPassword}>
              Redefinir Senha
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Email da Conta</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
