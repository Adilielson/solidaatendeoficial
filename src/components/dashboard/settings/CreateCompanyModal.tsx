import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Key, RefreshCw, Mail, Phone, Building } from "lucide-react";

interface CompanyFormValues {
  name: string;
  slug: string;
  email: string;
  phone: string;
  password?: string;
}

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateCompanyModal = ({ open, onOpenChange, onSuccess }: CreateCompanyModalProps) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<CompanyFormValues>();

  const companyName = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (companyName) {
      const slug = companyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [companyName, setValue]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", password);
    toast.info(`Senha gerada: ${password}`, { duration: 5000 });
  };

  const onSubmit = async (values: CompanyFormValues) => {
    if (!values.password) {
      toast.error("Gere uma senha provisória primeiro");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-company", {
        body: values
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Empresa e usuário criados com sucesso!");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(error.message || "Erro ao criar empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto & Proprietário</DialogTitle>
          <DialogDescription>
            Cadastre os dados completos para criar a empresa e a conta do administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5" /> Nome do Projeto
              </Label>
              <Input 
                id="name" 
                placeholder="Ex: Solida Digital" 
                {...register("name", { required: true })} 
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="slug">Link do Painel</Label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-2 rounded-l-md border border-r-0">solida.ai/</span>
                <Input 
                  id="slug" 
                  className="rounded-l-none h-9"
                  {...register("slug", { required: true })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> E-mail do Admin
              </Label>
              <Input 
                id="email" 
                type="email"
                placeholder="email@exemplo.com" 
                {...register("email", { required: true })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Celular/WhatsApp
              </Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                {...register("phone", { required: true })} 
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5" /> Senha Provisória
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="password" 
                  className="font-mono"
                  placeholder="Clique em gerar" 
                  {...register("password", { required: true })} 
                />
                <Button type="button" variant="outline" size="icon" onClick={generatePassword}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                O usuário poderá alterar esta senha no primeiro login.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cadastrar Tudo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
