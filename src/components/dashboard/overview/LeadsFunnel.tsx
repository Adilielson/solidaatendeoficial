import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsFunnelProps {
  total: number;
  qualified: number;
  discarded: number;
}

export const LeadsFunnel = ({ total, qualified, discarded }: LeadsFunnelProps) => {
  const max = Math.max(total, 1);
  const stages = [
    { label: "Total de contatos", value: total, color: "hsl(var(--primary))", width: 100 },
    { label: "Qualificados", value: qualified, color: "hsl(142, 69%, 58%)", width: (qualified / max) * 100 },
    { label: "Descartados", value: discarded, color: "hsl(0, 84%, 60%)", width: (discarded / max) * 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Funil de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            {stages.map((stage) => {
              const pct = total > 0 ? Math.round((stage.value / total) * 100) : 0;
              return (
                <div key={stage.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{stage.label}</span>
                    <span className="text-muted-foreground">
                      {stage.value} <span className="text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-8 w-full bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{ width: `${Math.max(stage.width, 2)}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
