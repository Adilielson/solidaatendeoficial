import { useState, useEffect } from "react";
import { Loader2, Projector, Clock, MessageSquareText, ShieldAlert, Settings2, UserCircle, Users, Sparkles } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import { useFollowupSettings } from "@/hooks/useFollowupSettings";
import { CompanyInfoCard } from "@/components/dashboard/settings/CompanyInfoCard";
import { UserProfileCard } from "@/components/dashboard/settings/UserProfileCard";
import { BusinessHoursCard } from "@/components/dashboard/settings/BusinessHoursCard";
import { FollowupCard } from "@/components/dashboard/settings/FollowupCard";
import { DangerZoneCard } from "@/components/dashboard/settings/DangerZoneCard";
import { AdminApiSettingsCard } from "@/components/dashboard/settings/AdminApiSettingsCard";
import { ProjectApiSettingsCard } from "@/components/dashboard/settings/ProjectApiSettingsCard";
import { AiSettingsCard } from "@/components/dashboard/settings/AiSettingsCard";
import DashboardTeam from "./DashboardTeam";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const DashboardSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const { company, role, canEdit, isOwner, loading: companyLoading, update, remove } = useCompany();
  const followup = useFollowupSettings();

  const superAdmins = ["solidaatende@gmail.com", "solidadigital01@gmail.com", "adilielson@gmail.com"];
  const isSuperAdmin = user?.email && superAdmins.map(e => e.toLowerCase()).includes(user.email.toLowerCase());


  // Mapeamento amigável de tipos de acesso
  const getAccessLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (role === "owner") return "Proprietário";
    if (role === "admin") return "Administrador";
    if (role === "agent") return "Agente";
    return "Membro";
  };

  if (authLoading || companyLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando suas configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background">
      <Tabs defaultValue="profile" className="flex w-full h-full">
        {/* Submenu Lateral Fixo - Lado a lado com o menu principal */}
        <aside className="w-[320px] border-r border-border bg-card/20 flex flex-col shrink-0">
          <div className="p-6 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Configurações</h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              Gerencie suas preferências e configurações do sistema.
            </p>
          </div>
          
          <TabsList className="flex flex-col h-auto bg-transparent p-3 space-y-1 items-stretch border-none shadow-none">
            <div className="pb-2 px-3">
              <p className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/60">Minha Conta</p>
            </div>
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <UserCircle className="h-4 w-4" />
              Meu Perfil
            </TabsTrigger>

            <div className="pt-6 pb-2 px-3">
              <p className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/60">Geral</p>
            </div>
            <TabsTrigger 
              value="company" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <Projector className="h-4 w-4" />
              Perfil do Projeto
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <Users className="h-4 w-4" />
              Gerenciar Equipe
            </TabsTrigger>
            <TabsTrigger 
              value="hours" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent whitespace-nowrap overflow-hidden"
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">Horário de atendimento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              Configurações da IA
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <Settings2 className="h-4 w-4" />
              Configurações API
            </TabsTrigger>
            <TabsTrigger 
              value="followup" 
              className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
            >
              <MessageSquareText className="h-4 w-4" />
              Follow-up
            </TabsTrigger>
            
            {isSuperAdmin && (
              <>
                <div className="pt-6 pb-2 px-3">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/60">Administração</p>
                </div>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 text-muted-foreground border-none shadow-none bg-transparent"
                >
                  <Settings2 className="h-4 w-4" />
                  API Global (Admin)
                </TabsTrigger>
              </>
            )}
            
            {isOwner && (
              <div className="mt-auto pt-4">
                <TabsTrigger 
                  value="danger" 
                  className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-destructive hover:bg-destructive/10 data-[state=active]:bg-destructive data-[state=active]:text-white border-none shadow-none bg-transparent w-full"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Avançado
                </TabsTrigger>
              </div>
            )}
          </TabsList>
        </aside>

        {/* Conteúdo Principal com Scroll Independente */}
        <main className="flex-1 overflow-y-auto bg-background/50 scroll-smooth">
          <div className="max-w-4xl p-8 lg:p-12 mx-auto w-full">
            <TabsContent value="profile" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <UserProfileCard />
            </TabsContent>

            <TabsContent value="company" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {company ? (
                <CompanyInfoCard company={company} canEdit={canEdit} onUpdate={update} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Configurando projeto...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="-m-6">
                <DashboardTeam />
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {company ? (
                <BusinessHoursCard company={company} canEdit={canEdit} onUpdate={update} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Configurando projeto...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {company ? (
                <AiSettingsCard company={company} canEdit={canEdit} onUpdate={update} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Configurando projeto...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="api" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {company ? (
                <ProjectApiSettingsCard company={company} canEdit={canEdit} onUpdate={update} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Configurando projeto...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="followup" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FollowupCard
                settings={followup.settings}
                logs={followup.logs}
                canEdit={canEdit}
                onUpdate={followup.update}
              />
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="admin" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                {company ? (
                  <AdminApiSettingsCard company={company} onUpdate={update} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Configurando projeto...</p>
                  </div>
                )}
              </TabsContent>
            )}

            {isOwner && (
              <TabsContent value="danger" className="mt-0 space-y-6 focus-visible:outline-none border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                {company ? (
                  <DangerZoneCard company={company} onDelete={remove} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Configurando projeto...</p>
                  </div>
                )}
              </TabsContent>
            )}

          </div>
        </main>
      </Tabs>
    </div>
  );
};

export default DashboardSettings;
