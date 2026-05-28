import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LeadsDonutProps {
  qualified: number;
  discarded: number;
  unclassified: number;
}

const COLORS = {
  qualified: "hsl(142, 69%, 58%)",
  discarded: "hsl(0, 84%, 60%)",
  unclassified: "hsl(0, 0%, 55%)",
};

const LABELS: Record<string, string> = {
  qualified: "Qualificados",
  discarded: "Descartados",
  unclassified: "Não classificados",
};

export const LeadsDonut = ({ qualified, discarded, unclassified }: LeadsDonutProps) => {
  const data = [
    { name: "qualified", value: qualified },
    { name: "discarded", value: discarded },
    { name: "unclassified", value: unclassified },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Nenhum contato cadastrado ainda
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      return (
                        <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
                          <p className="font-medium text-foreground">{LABELS[item.name as string] ?? item.name}</p>
                          <p className="text-muted-foreground">{item.value} contatos</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }} />
                  <span className="text-sm text-foreground">
                    {LABELS[entry.name]} — {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
