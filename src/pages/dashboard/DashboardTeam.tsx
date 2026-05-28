import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, User, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  user_id: string;
  role: "admin" | "agent";
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

const roleLabels: Record<string, string> = { admin: "Administrador", agent: "Atendente" };
const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  agent: "bg-secondary text-secondary-foreground border-border",
};

const DashboardTeam = () => {
  const { companyId, loading: companyLoading } = useCompanyId();
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "agent">("agent");

  const fetchMembers = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from("company_members")
      .select("id, user_id, role, created_at, profile:profiles!company_members_user_id_fkey(full_name, avatar_url, phone)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    setMembers((data as TeamMember[]) ?? []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchMembers();
  }, [companyId, fetchMembers]);

  const handleCreate = async () => {
    if (!companyId || !formName || !formEmail || !formPassword) {
      toast.error("Preencha nome, email e senha");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-team-member", {
        body: {
          action: "create",
          company_id: companyId,
          full_name: formName,
          email: formEmail,
          password: formPassword,
          phone: formPhone || null,
          role: formRole,
        },
      });

      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Erro ao criar atendente");
      } else {
        toast.success("Atendente criado com sucesso");
        setInviteOpen(false);
        resetForm();
        fetchMembers();
      }
    } catch {
      toast.error("Erro inesperado");
    }
    setCreating(false);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("company_members")
      .update({ role: newRole as any })
      .eq("id", memberId);

    if (error) {
      toast.error("Erro ao alterar papel");
    } else {
      toast.success("Papel atualizado");
      fetchMembers();
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    const { error } = await supabase
      .from("company_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error("Erro ao remover membro");
    } else {
      toast.success(`${memberName} removido da equipe`);
      fetchMembers();
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormRole("agent");
  };

  const getInitials = (name: string | null) =>
    (name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const adminCount = members.filter((m) => m.role === "admin").length;

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-sm text-muted-foreground">Gerencie atendentes e permissões</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" />Novo Atendente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Atendente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input placeholder="Nome completo" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@empresa.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input type="password" placeholder="Mínimo 6 caracteres" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as "admin" | "agent")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Atendente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Atendente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Total de membros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.filter((m) => m.role === "agent").length}</p>
                <p className="text-xs text-muted-foreground">Atendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Shield className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum membro na equipe ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const name = member.profile?.full_name ?? "Sem nome";
                  const isSelf = member.user_id === user?.id;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profile?.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {name}{isSelf && " (Você)"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.profile?.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(v) => handleRoleChange(member.id, v)}
                          disabled={isSelf}
                        >
                          <SelectTrigger className="h-7 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Atendente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {!isSelf && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover membro</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover <strong>{name}</strong> da equipe? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleRemove(member.id, name)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTeam;
