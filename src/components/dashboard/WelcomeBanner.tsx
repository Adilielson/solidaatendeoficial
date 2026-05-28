import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

/**
 * Banner de boas-vindas exibido enquanto o cadastro da empresa
 * estiver "padrão" (nome igual ao do usuário/email, sem logo).
 * Some quando a empresa tiver um nome customizado E logo.
 */
export function WelcomeBanner() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [dismissed, setDismissed] = useState(false);

  if (!company || dismissed) return null;

  const defaultLikeName =
    !!user?.email &&
    (company.name === user.email.split("@")[0] ||
      company.name.toLowerCase() === user.email.split("@")[0].toLowerCase());

  const needsSetup = defaultLikeName || !company.logo_url;
  if (!needsSetup) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "por aí";

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">
            Bem-vindo(a), {firstName}! 👋
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sua conta está pronta. Para o sistema funcionar 100%, complete o
            cadastro do seu projeto: nome, logo e horário de atendimento.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/dashboard/configuracoes">
            Completar cadastro
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
