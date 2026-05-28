import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Bot,
  Smartphone,
  ListChecks,
  FlaskConical,
  Package,
  UserCircle,
  File,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useAiGlobal } from "@/hooks/useAiGlobal";
import { useCompany } from "@/hooks/useCompany";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Projector } from "lucide-react";

const mainItems = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Conversas", url: "/dashboard/conversas", icon: MessageSquare },
  { title: "Triagem", url: "/dashboard/triagem", icon: ListChecks },
  { title: "Produtos", url: "/dashboard/produtos", icon: Package },
  { title: "Clientes", url: "/dashboard/clientes", icon: UserCircle },
  { title: "Sandbox", url: "/dashboard/sandbox", icon: FlaskConical },
  { title: "Equipe", url: "/dashboard/equipe", icon: Users },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
  { title: "Página em Branco", url: "/dashboard/branco", icon: File },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { aiGlobalEnabled, toggle } = useAiGlobal();
  const { company, role } = useCompany();

  const initials = (company?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "•";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div
          className={
            collapsed
              ? "flex items-center justify-center py-4"
              : "flex items-center gap-2.5 px-4 py-4"
          }
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
            <span className="text-sm font-extrabold text-primary-foreground">S</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                Solida<span className="text-primary">Atende</span>
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url || (item.url === "/dashboard" && location.pathname === "/dashboard")}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="relative hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-full before:bg-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="px-3 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">IA Global</span>
              </div>
              <Switch
                checked={aiGlobalEnabled}
                onCheckedChange={toggle}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {aiGlobalEnabled ? "IA ativa em todas as conversas" : "IA pausada globalmente"}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
