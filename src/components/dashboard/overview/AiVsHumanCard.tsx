import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import type { AiSplit } from "@/hooks/useDashboardData";

export const AiVsHumanCard = ({ data }: { data: AiSplit }) => {
  const total = data.ai + data.human;
  const humanPct = 100 - data.aiPct;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mensagens enviadas: IA vs Humano</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Nenhuma mensagem enviada no período
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{data.aiPct}%</span>
              <span className="text-sm text-muted-foreground">automatizadas pela IA</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${data.aiPct}%` }} />
              <div className="h-full bg-[hsl(142,69%,58%)] transition-all" style={{ width: `${humanPct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{data.ai}</span>
                <span className="text-muted-foreground">IA</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[hsl(142,69%,58%)]" />
                <span className="text-foreground font-medium">{data.human}</span>
                <span className="text-muted-foreground">Humano</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
