import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Company } from "@/hooks/useCompany";

type Props = {
  company: Company;
  onDelete: () => Promise<{ error: any }>;
};

export function DangerZoneCard({ company, onDelete }: Props) {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canConfirm = confirmText.trim() === company.name;

  const handleDelete = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    const { error } = await onDelete();
    if (error) {
      toast.error("Erro ao excluir projeto");
      setDeleting(false);
      return;
    }
    toast.success("Projeto excluído");
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações irreversíveis. Visível apenas ao proprietário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div>
            <p className="text-sm font-medium">Excluir projeto</p>
            <p className="text-xs text-muted-foreground mt-1">
              Remove permanentemente o projeto, contatos, conversas, fluxos e instâncias do WhatsApp.
            </p>
          </div>
          <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirmText(""); }}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação <strong>não pode ser desfeita</strong>. Todos os dados do projeto serão
                  permanentemente removidos. Para confirmar, digite o nome do projeto abaixo:
                  <span className="block mt-2 font-mono text-foreground">{company.name}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label>Nome do projeto</Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={company.name}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={!canConfirm || deleting}
                  onClick={handleDelete}
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Excluir definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
