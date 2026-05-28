import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { CheckCircle2, RefreshCw, Smartphone, AlertCircle, Power } from "lucide-react";

const steps = [
  "Abra o WhatsApp no seu celular",
  "Toque em Mais opções (⋮) ou Configurações",
  'Toque em "Aparelhos conectados" → "Conectar um aparelho"',
  "Aponte a câmera para o QR Code abaixo",
];

const DashboardWhatsApp = () => {
  const { instance, qrCode, loading, actionLoading, error, loadInstance, refreshQr, disconnect } =
    useWhatsApp();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte sua conta do WhatsApp para que o agente comece a atender.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={loadInstance}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-64" />
          </CardContent>
        </Card>
      ) : instance?.is_connected ? (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/15 p-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">WhatsApp conectado</CardTitle>
                <CardDescription>O agente já pode receber e responder mensagens.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Instância</p>
                <p className="font-medium text-foreground">{instance.instance_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className="mt-1">Conectado</Badge>
              </div>
              {instance.phone_number && (
                <div>
                  <p className="text-muted-foreground">Número</p>
                  <p className="font-medium text-foreground">{instance.phone_number}</p>
                </div>
              )}
              {instance.last_connection_at && (
                <div>
                  <p className="text-muted-foreground">Última conexão</p>
                  <p className="font-medium text-foreground">
                    {new Date(instance.last_connection_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={disconnect} disabled={actionLoading}>
                <Power className="h-4 w-4" />
                Desconectar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <Smartphone className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Conectar WhatsApp</CardTitle>
                <CardDescription>Escaneie o QR Code abaixo para conectar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <ol className="space-y-3 text-sm">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-foreground pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-lg border bg-background p-4 flex items-center justify-center w-64 h-64">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full" />
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                      Gerando QR Code...
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={refreshQr} disabled={actionLoading}>
                  <RefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
                  Atualizar QR Code
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  O status atualiza automaticamente após o escaneamento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardWhatsApp;
