import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FollowupLog } from "@/hooks/useFollowupSettings";

const statusCfg: Record<FollowupLog["status"], { label: string; cls: string }> = {
  sent: { label: "Enviado", cls: "bg-green-500/15 text-green-400 border-green-500/30" },
  failed: { label: "Falhou", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  blocked: { label: "Bloqueado", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  invalid_number: { label: "Nº inválido", cls: "bg-muted text-muted-foreground border-border" },
};

export function FollowupLogsTable({ logs }: { logs: FollowupLog[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border pt-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between" size="sm">
          <span className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Histórico de envios ({logs.length})
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Nenhum follow-up enviado ainda.
          </p>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Tentativa</TableHead>
                  <TableHead className="text-xs">Origem</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(l.sent_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs">{l.attempt_number}ª</TableCell>
                    <TableCell className="text-xs capitalize">
                      {l.template_used === "ai" ? "IA" : "Template"}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border text-[10px]", statusCfg[l.status].cls)}>
                        {statusCfg[l.status].label}
                      </Badge>
                      {l.error && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]" title={l.error}>
                          {l.error}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs">
                      <p className="truncate" title={l.message}>{l.message}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
