import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TriageFunnel as TF } from "@/hooks/useDashboardData";

export const TriageFunnel = ({ data }: { data: TF }) => {
  const max = Math.max(data.started, 1);
  const stages = [
    { label: "Iniciaram triagem", value: data.started, color: "hsl(var(--primary))" },
    { label: "Responderam", value: data.responded, color: "hsl(217, 91%, 60%)" },
    { label: "Completaram", value: data.completed, color: "hsl(38, 92%, 50%)" },
    { label: "Qualificados", value: data.qualified, color: "hsl(142, 69%, 58%)" },
    { label: "Descartados", value: data.discarded, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Funil de Triagem</CardTitle>
      </CardHeader>
      <CardContent>
        {data.started === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Sem conversas no período
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            {stages.map((s) => {
              const pct = data.started > 0 ? Math.round((s.value / data.started) * 100) : 0;
              const width = (s.value / max) * 100;
              return (
                <div key={s.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{s.label}</span>
                    <span className="text-muted-foreground">
                      {s.value} <span className="text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-7 w-full bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{ width: `${Math.max(width, 2)}%`, backgroundColor: s.color }}
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
