import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import type { SandboxSession } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

type Props = {
  sessions: SandboxSession[];
  onLoad: (s: SandboxSession) => void;
};

export function SandboxHistory({ sessions, onLoad }: Props) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Histórico recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {sessions.map((s) => {
            const status = s.summary?.status;
            const cls =
              status === "qualified"
                ? "bg-green-500/15 text-green-400"
                : status === "discarded"
                ? "bg-destructive/15 text-destructive"
                : status === "transfer"
                ? "bg-amber-500/15 text-amber-400"
                : "bg-muted text-muted-foreground";
            return (
              <button
                key={s.id}
                onClick={() => onLoad(s)}
                className="w-full text-left p-2 rounded border border-border hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {s.mode === "strict" ? "Estrito" : "Livre"}
                  </Badge>
                  <Badge className={cn("text-[10px]", cls)}>
                    {status ?? "em aberto"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleString("pt-BR")} • {s.messages?.length ?? 0} msgs
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
