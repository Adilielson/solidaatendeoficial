import { Send, Heart, AlertTriangle, Ban } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { FollowupMetrics } from "@/hooks/useDashboardData";

export const FollowupKpiCards = ({ data, loading }: { data: FollowupMetrics; loading?: boolean }) => (
  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
    <MetricCard icon={Send} label="Follow-ups enviados" value={data.sent} loading={loading} variant="primary" />
    <MetricCard
      icon={Heart}
      label="Taxa de reengajamento"
      value={`${data.reengagementRate}%`}
      loading={loading}
      variant="success"
    />
    <MetricCard icon={AlertTriangle} label="Falhas (bloqueio/inválido)" value={data.failed} loading={loading} variant="destructive" />
    <MetricCard icon={Ban} label="Conversas exauridas" value={data.exhausted} loading={loading} variant="warning" />
  </div>
);
