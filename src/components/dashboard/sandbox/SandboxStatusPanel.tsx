import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ListChecks, UserPlus, RotateCcw, Sparkles } from "lucide-react";
import type { TriageStep } from "@/hooks/useTriageFlow";
import type { FinalizePayload } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

type Props = {
  steps: TriageStep[];
  summary: FinalizePayload | null;
  onCreateContact: () => void;
  onReset: () => void;
  creatingContact: boolean;
};

const statusConfig = {
  qualified: { label: "Qualificado", cls: "bg-green-500/15 text-green-400 border-green-500/30" },
  discarded: { label: "Descartado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  transfer: { label: "Transferir p/ humano", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export function SandboxStatusPanel({ steps, summary, onCreateContact, onReset, creatingContact }: Props) {
  const answeredIds = new Set(summary?.answers.map((a) => a.step_id) ?? []);

  return (
    <div className="space-y-4">
      {summary ? (
        <Card className="border-primary/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Resultado da triagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge className={cn("border", statusConfig[summary.status].cls)}>
                {statusConfig[summary.status].label}
              </Badge>
              <p className="text-xs text-muted-foreground italic">"{summary.reasoning}"</p>
            </div>

            {summary.answers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Respostas coletadas
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {summary.answers.map((a, i) => (
                    <div key={i} className="text-xs space-y-0.5 p-2 rounded bg-muted/40">
                      <p className="text-muted-foreground">{a.question}</p>
                      <p className="font-medium">{a.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(summary.contact_name || summary.contact_phone || summary.contact_email) && (
              <div className="text-xs space-y-1 p-2 rounded bg-primary/5 border border-primary/20">
                {summary.contact_name && <p><span className="text-muted-foreground">Nome:</span> {summary.contact_name}</p>}
                {summary.contact_phone && <p><span className="text-muted-foreground">Tel:</span> {summary.contact_phone}</p>}
                {summary.contact_email && <p><span className="text-muted-foreground">Email:</span> {summary.contact_email}</p>}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button size="sm" onClick={onCreateContact} disabled={creatingContact}>
                <UserPlus className="h-4 w-4 mr-2" />
                {creatingContact ? "Criando..." : "Criar contato real"}
              </Button>
              <Button size="sm" variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Novo teste
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Etapas do fluxo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steps.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma etapa configurada. Vá em Triagem para criar.
              </p>
            ) : (
              <ol className="space-y-2">
                {steps.map((s, i) => {
                  const done = answeredIds.has(s.id);
                  return (
                    <li key={s.id} className="flex items-start gap-2 text-xs">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(done ? "text-foreground" : "text-muted-foreground")}>
                          <span className="font-medium">{i + 1}.</span> {s.question}
                        </p>
                        <div className="flex gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {s.field_type === "list" ? "lista" : "texto"}
                          </span>
                          {s.is_required && (
                            <span className="text-[10px] text-muted-foreground">• obrigatório</span>
                          )}
                          {s.conclusion_action && (
                            <span className="text-[10px] text-amber-500">• {s.conclusion_action}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
