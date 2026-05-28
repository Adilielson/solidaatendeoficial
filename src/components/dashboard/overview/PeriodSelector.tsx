import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import type { DashboardPeriod } from "@/hooks/useDashboardData";

const presets = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
] as const;

const buildPreset = (days: number, label: string): DashboardPeriod => {
  const to = new Date(); to.setHours(23, 59, 59, 999);
  const from = new Date(); from.setDate(from.getDate() - (days - 1)); from.setHours(0, 0, 0, 0);
  return { from, to, label };
};

export const defaultPeriod = () => buildPreset(7, "Últimos 7 dias");

interface Props {
  period: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}

export const PeriodSelector = ({ period, onChange }: Props) => {
  const [active, setActive] = useState<string>("7d");
  const [range, setRange] = useState<DateRange | undefined>();

  const handlePreset = (p: typeof presets[number]) => {
    setActive(p.key);
    onChange(buildPreset(p.days, `Últimos ${p.label}`));
  };

  const handleRange = (r: DateRange | undefined) => {
    setRange(r);
    if (r?.from && r?.to) {
      const from = new Date(r.from); from.setHours(0, 0, 0, 0);
      const to = new Date(r.to); to.setHours(23, 59, 59, 999);
      setActive("custom");
      onChange({ from, to, label: `${format(from, "dd/MM", { locale: ptBR })} – ${format(to, "dd/MM", { locale: ptBR })}` });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((p) => (
        <Button
          key={p.key}
          variant={active === p.key ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset(p)}
        >
          {p.label}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={active === "custom" ? "default" : "outline"}
            size="sm"
            className={cn("font-normal")}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {active === "custom" ? period.label : "Personalizado"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRange}
            numberOfMonths={2}
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
