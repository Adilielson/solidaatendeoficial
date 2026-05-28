import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.tsx";
import DashboardConversations from "./pages/dashboard/DashboardConversations.tsx";
import DashboardTeam from "./pages/dashboard/DashboardTeam.tsx";
import DashboardSettings from "./pages/dashboard/DashboardSettings.tsx";
import DashboardWhatsApp from "./pages/dashboard/DashboardWhatsApp.tsx";
import DashboardTriage from "./pages/dashboard/DashboardTriage.tsx";
import DashboardSandbox from "./pages/dashboard/DashboardSandbox.tsx";
import DashboardProducts from "./pages/dashboard/DashboardProducts.tsx";
import DashboardCustomers from "./pages/dashboard/DashboardCustomers.tsx";
import BlankPage from "./pages/dashboard/BlankPage.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="conversas" element={<DashboardConversations />} />
              <Route path="whatsapp" element={<DashboardWhatsApp />} />
              <Route path="triagem" element={<DashboardTriage />} />
              <Route path="produtos" element={<DashboardProducts />} />
              <Route path="clientes" element={<DashboardCustomers />} />
              <Route path="sandbox" element={<DashboardSandbox />} />
              <Route path="equipe" element={<DashboardTeam />} />
              <Route path="configuracoes" element={<DashboardSettings />} />
              <Route path="branco" element={<BlankPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
