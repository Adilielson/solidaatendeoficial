import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";

export interface DailyMessages {
  day: string;
  inbound: number;
  outbound: number;
}

interface MessagesBarChartProps {
  data: DailyMessages[];
  loading?: boolean;
}

export const MessagesBarChart = ({ data, loading }: MessagesBarChartProps) => {
  const hasData = data.some((d) => d.inbound > 0 || d.outbound > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mensagens por dia</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Carregando...</div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Nenhuma mensagem no período
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar dataKey="inbound" name="Recebidas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" name="Enviadas" fill="hsl(142, 69%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
