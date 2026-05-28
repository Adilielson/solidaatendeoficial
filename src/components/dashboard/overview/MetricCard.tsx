import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  loading?: boolean;
  variant?: "default" | "primary" | "destructive" | "success" | "warning";
}

const variantClasses = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-primary/10 text-primary",
  warning: "bg-[hsl(38_92%_50%)]/10 text-[hsl(38_92%_50%)]",
};

export const MetricCard = ({ icon: Icon, label, value, loading, variant = "default" }: MetricCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", variantClasses[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{loading ? "—" : value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
