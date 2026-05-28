import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Smartphone, ArrowRight, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WhatsAppSnapshot } from "@/hooks/useDashboardData";

export const WhatsAppStatusCard = ({ data }: { data: WhatsAppSnapshot }) => {
  const connected = data?.connected;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-[hsl(142,69%,58%)]/10 text-[hsl(142,69%,58%)]" : "bg-destructive/10 text-destructive"}`}>
            {connected ? <Smartphone className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">WhatsApp</p>
              <Badge variant={connected ? "default" : "destructive"} className="text-[10px]">
                {connected ? "Conectado" : data ? "Desconectado" : "Não configurado"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data?.phone ?? "Configure uma instância"}
              {data?.lastConnectionAt && ` • ${formatDistanceToNow(new Date(data.lastConnectionAt), { addSuffix: true, locale: ptBR })}`}
            </p>
          </div>
          <Link to="/dashboard/whatsapp" className="text-xs text-primary hover:underline flex items-center gap-1">
            Gerenciar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
