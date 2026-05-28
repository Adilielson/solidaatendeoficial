import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import type { BusinessHours, BusinessHourDay, Company } from "@/hooks/useCompany";

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: "mon", label: "Segunda-feira" },
  { key: "tue", label: "Terça-feira" },
  { key: "wed", label: "Quarta-feira" },
  { key: "thu", label: "Quinta-feira" },
  { key: "fri", label: "Sexta-feira" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

type Props = {
  company: Company;
  canEdit: boolean;
  onUpdate: (patch: { business_hours: BusinessHours }) => Promise<{ error: any }>;
};

export function BusinessHoursCard({ company, canEdit, onUpdate }: Props) {
  const [hours, setHours] = useState<BusinessHours>(company.business_hours);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(hours) !== JSON.stringify(company.business_hours);

  const updateDay = (key: keyof BusinessHours, patch: Partial<BusinessHourDay>) => {
    setHours((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const copyToAll = () => {
    const monday = hours.mon;
    const next = DAYS.reduce((acc, d) => {
      acc[d.key] = { ...monday };
      return acc;
    }, {} as BusinessHours);
    setHours(next);
    toast.success("Horário de segunda copiado para todos os dias");
  };

  const handleSave = async () => {
    // validate start < end where enabled
    for (const d of DAYS) {
      const v = hours[d.key];
      if (v.enabled && v.start >= v.end) {
        toast.error(`${d.label}: horário de início deve ser antes do fim`);
        return;
      }
    }
    setSaving(true);
    const { error } = await onUpdate({ business_hours: hours });
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Horários atualizados");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horário de Atendimento
            </CardTitle>
            <CardDescription className="mt-1">
              A IA responde apenas dentro destes horários. Fora deles, as mensagens ficam aguardando atendimento.
            </CardDescription>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={copyToAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar segunda
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key];
          return (
            <div
              key={key}
              className="flex items-center gap-4 py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3 w-44">
                <Switch
                  checked={day.enabled}
                  disabled={!canEdit}
                  onCheckedChange={(v) => updateDay(key, { enabled: v })}
                />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={day.start}
                  disabled={!canEdit || !day.enabled}
                  onChange={(e) => updateDay(key, { start: e.target.value })}
                  className="w-32"
                />
                <span className="text-muted-foreground text-sm">até</span>
                <Input
                  type="time"
                  value={day.end}
                  disabled={!canEdit || !day.enabled}
                  onChange={(e) => updateDay(key, { end: e.target.value })}
                  className="w-32"
                />
                {!day.enabled && (
                  <span className="text-xs text-muted-foreground ml-2">Fechado</span>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={!canEdit || !dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
