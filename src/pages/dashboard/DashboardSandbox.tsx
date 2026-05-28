import { useState } from "react";
import { Loader2, FlaskConical, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSandbox } from "@/hooks/useSandbox";
import { useCompany } from "@/hooks/useCompany";
import { SandboxChat } from "@/components/dashboard/sandbox/SandboxChat";
import { SandboxStatusPanel } from "@/components/dashboard/sandbox/SandboxStatusPanel";
import { SandboxHistory } from "@/components/dashboard/sandbox/SandboxHistory";
import { toast } from "sonner";

const DashboardSandbox = () => {
  const { company, loading: companyLoading } = useCompany();
  const sandbox = useSandbox();
  const [creatingContact, setCreatingContact] = useState(false);

  const handleCreateContact = async () => {
    setCreatingContact(true);
    const id = await sandbox.createContactFromSummary();
    setCreatingContact(false);
    if (id) toast.success("Contato criado a partir do teste");
    else toast.error("Erro ao criar contato");
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return <div className="p-6 text-sm text-muted-foreground">Projeto não encontrado.</div>;
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Sandbox do Agente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Converse com a IA exatamente como um lead faria — sem enviar nada pelo WhatsApp.
          </p>
        </div>
      </div>

      {!sandbox.hasFlow && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Nenhuma etapa de triagem configurada</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure ao menos uma pergunta no fluxo de triagem para testar o agente.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/triagem">Ir para Triagem</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-2 min-h-[600px]">
          <SandboxChat
            messages={sandbox.messages}
            streaming={sandbox.streaming}
            mode={sandbox.mode}
            onModeChange={sandbox.setMode}
            onSend={sandbox.send}
            onReset={sandbox.reset}
            companyName={company.name}
            error={sandbox.error}
            disabled={!sandbox.hasFlow}
            finished={!!sandbox.summary}
          />
        </div>
        <div className="space-y-4">
          <SandboxStatusPanel
            steps={sandbox.steps}
            summary={sandbox.summary}
            onCreateContact={handleCreateContact}
            onReset={sandbox.reset}
            creatingContact={creatingContact}
          />
          <SandboxHistory sessions={sandbox.history} onLoad={sandbox.loadSession} />
        </div>
      </div>
    </div>
  );
};

export default DashboardSandbox;
