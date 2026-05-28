import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname.includes("/dashboard/configuracoes");

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center border-b border-border px-6 gap-5 bg-card/60 backdrop-blur-sm shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <span className="text-sm font-extrabold text-primary-foreground">S</span>
              </div>
              <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                Solida<span className="text-primary">Atende</span>
              </span>
            </div>
          </header>
          <main className={`flex-1 overflow-auto bg-background`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

