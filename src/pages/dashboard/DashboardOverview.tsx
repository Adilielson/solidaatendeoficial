import { useState } from "react";
import { MessageSquare, UserCheck, UserX, Clock, MessageCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useDashboardData, type DashboardPeriod } from "@/hooks/useDashboardData";
import { MetricCard } from "@/components/dashboard/overview/MetricCard";
import { LeadsDonut } from "@/components/dashboard/overview/LeadsDonut";
import { MessagesBarChart } from "@/components/dashboard/overview/MessagesBarChart";
import { TriageFunnel } from "@/components/dashboard/overview/TriageFunnel";
import { RecentConversations } from "@/components/dashboard/overview/RecentConversations";
import { PeriodSelector, defaultPeriod } from "@/components/dashboard/overview/PeriodSelector";
import { WhatsAppStatusCard } from "@/components/dashboard/overview/WhatsAppStatusCard";
import { FollowupKpiCards } from "@/components/dashboard/overview/FollowupKpiCards";
import { AiVsHumanCard } from "@/components/dashboard/overview/AiVsHumanCard";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";

const DashboardOverview = () => {
  const { companyId } = useCompanyId();
  const [period, setPeriod] = useState<DashboardPeriod>(defaultPeriod());
  const { loading, leadMetrics, convMetrics, messagesData, recent, followup, funnel, aiSplit, whatsapp, refetch } =
    useDashboardData(companyId, period);

  return (
    <div className="p-6 space-y-6">
      <WelcomeBanner />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe métricas e atendimentos em tempo real • <span className="text-foreground font-medium">{period.label}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector period={period} onChange={setPeriod} />
          <Button variant="outline" size="icon" onClick={refetch} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* WhatsApp + lead metrics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <WhatsAppStatusCard data={whatsapp} />
        </div>
        <MetricCard icon={MessageSquare} label="Total de contatos" value={leadMetrics.total} loading={loading} />
        <MetricCard icon={UserCheck} label="Leads qualificados" value={leadMetrics.qualified} loading={loading} variant="success" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={UserX} label="Leads descartados" value={leadMetrics.discarded} loading={loading} variant="destructive" />
        <MetricCard icon={Clock} label="Não classificados" value={leadMetrics.unclassified} loading={loading} />
        <MetricCard icon={MessageCircle} label="Conversas abertas" value={convMetrics.open} loading={loading} variant="primary" />
        <MetricCard icon={AlertCircle} label="Pendentes" value={convMetrics.pending} loading={loading} variant="warning" />
      </div>

      {/* Follow-up KPIs */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Follow-up automático</h2>
        <FollowupKpiCards data={followup} loading={loading} />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <MessagesBarChart data={messagesData} loading={loading} />
        <TriageFunnel data={funnel} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <AiVsHumanCard data={aiSplit} />
        <LeadsDonut
          qualified={leadMetrics.qualified}
          discarded={leadMetrics.discarded}
          unclassified={leadMetrics.unclassified}
        />
      </div>

      <div className="grid gap-6 grid-cols-1">
        <RecentConversations conversations={recent} loading={loading} />
        <MetricCard icon={CheckCircle2} label="Conversas fechadas" value={convMetrics.closed} loading={loading} />
      </div>
    </div>
  );
};

export default DashboardOverview;
