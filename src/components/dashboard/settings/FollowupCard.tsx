import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircleHeart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { FollowupSettings } from "@/hooks/useFollowupSettings";
import { FollowupLogsTable } from "./FollowupLogsTable";
import type { FollowupLog } from "@/hooks/useFollowupSettings";

const schema = z.object({
  first: z.number().int().min(1).max(168),
  second: z.number().int().min(2).max(168),
  template_first: z.string().trim().min(10).max(500),
  template_second: z.string().trim().min(10).max(500),
}).refine((d) => d.second > d.first, { message: "2ª tentativa deve ser depois da 1ª" });

type Props = {
  settings: FollowupSettings;
  logs: FollowupLog[];
  canEdit: boolean;
  onUpdate: (patch: Partial<FollowupSettings>) => Promise<{ error: any }>;
};

export function FollowupCard({ settings, logs, canEdit, onUpdate }: Props) {
  const [enabled, setEnabled] = useState(settings.followup_enabled);
  const [first, setFirst] = useState(settings.followup_intervals_hours[0] ?? 24);
  const [second, setSecond] = useState(settings.followup_intervals_hours[1] ?? 72);
  const [tplFirst, setTplFirst] = useState(settings.followup_template_first);
  const [tplSecond, setTplSecond] = useState(settings.followup_template_second);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(settings.followup_enabled);
    setFirst(settings.followup_intervals_hours[0] ?? 24);
    setSecond(settings.followup_intervals_hours[1] ?? 72);
    setTplFirst(settings.followup_template_first);
    setTplSecond(settings.followup_template_second);
  }, [settings]);

  const dirty =
    enabled !== settings.followup_enabled ||
    first !== (settings.followup_intervals_hours[0] ?? 24) ||
    second !== (settings.followup_intervals_hours[1] ?? 72) ||
    tplFirst !== settings.followup_template_first ||
    tplSecond !== settings.followup_template_second;

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    const { error } = await onUpdate({ followup_enabled: value });
    if (error) toast.error("Erro ao atualizar");
    else toast.success(value ? "Follow-up ativado" : "Follow-up desativado");
  };

  const handleSave = async () => {
    const parsed = schema.safeParse({
      first, second, template_first: tplFirst, template_second: tplSecond,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await onUpdate({
      followup_intervals_hours: [first, second],
      followup_template_first: tplFirst.trim(),
      followup_template_second: tplSecond.trim(),
    });
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações de follow-up salvas");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircleHeart className="h-5 w-5 text-primary" />
              Follow-up Automático
            </CardTitle>
            <CardDescription className="mt-1">
              Reengaje leads que pararam de responder durante a triagem. Máximo de 2 tentativas.
            </CardDescription>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} disabled={!canEdit} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={enabled ? "space-y-6" : "space-y-6 opacity-50 pointer-events-none"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>1ª tentativa após (horas)</Label>
              <Input
                type="number"
                min={1}
                max={168}
                value={first}
                onChange={(e) => setFirst(parseInt(e.target.value || "0", 10))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>2ª tentativa após (horas)</Label>
              <Input
                type="number"
                min={2}
                max={168}
                value={second}
                onChange={(e) => setSecond(parseInt(e.target.value || "0", 10))}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mensagem da 1ª tentativa</Label>
              <Badge variant="outline" className="text-[10px]">Template fixo</Badge>
            </div>
            <Textarea
              rows={3}
              value={tplFirst}
              onChange={(e) => setTplFirst(e.target.value)}
              maxLength={500}
              disabled={!canEdit}
            />
            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis: <code className="font-mono">{"{{nome}}"}</code>{" "}
              <code className="font-mono">{"{{empresa}}"}</code>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mensagem da 2ª tentativa (fallback)</Label>
              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                IA contextualizada
              </Badge>
            </div>
            <Textarea
              rows={3}
              value={tplSecond}
              onChange={(e) => setTplSecond(e.target.value)}
              maxLength={500}
              disabled={!canEdit}
            />
            <p className="text-xs text-muted-foreground">
              A 2ª mensagem é gerada pela IA com base no histórico da conversa. Este texto é usado apenas como fallback caso a IA falhe.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canEdit || !dirty || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar configurações
            </Button>
          </div>
        </div>

        <FollowupLogsTable logs={logs} />
      </CardContent>
    </Card>
  );
}
