import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface RecentConversation {
  id: string;
  contactName: string | null;
  contactPhone: string;
  status: "open" | "closed" | "pending";
  lastMessageAt: string | null;
  aiEnabled: boolean;
}

const statusLabels: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  closed: "Fechada",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  open: "default",
  pending: "secondary",
  closed: "outline",
};

interface Props {
  conversations: RecentConversation[];
  loading?: boolean;
}

export const RecentConversations = ({ conversations, loading }: Props) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg">Conversas recentes</CardTitle>
      <Link to="/dashboard/conversas" className="text-xs text-primary hover:underline flex items-center gap-1">
        Ver todas <ArrowRight className="h-3 w-3" />
      </Link>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Carregando...</div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
          <MessageSquare className="h-6 w-6" />
          Nenhuma conversa ainda
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to="/dashboard/conversas"
              className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                {(conv.contactName || conv.contactPhone).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {conv.contactName || conv.contactPhone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {conv.lastMessageAt
                    ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: ptBR })
                    : "Sem mensagens"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {conv.aiEnabled && (
                  <Badge variant="outline" className="text-xs">
                    IA
                  </Badge>
                )}
                <Badge variant={statusVariants[conv.status]} className="text-xs">
                  {statusLabels[conv.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
