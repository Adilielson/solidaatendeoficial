import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Save, Volume2, Play, Mic, Heart } from "lucide-react";
import { useAiSettings } from "@/hooks/useAiSettings";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Company, VoiceId } from "@/hooks/useCompany";

interface AiSettingsCardProps {
  company: Company;
  canEdit: boolean;
  onUpdate: (patch: Partial<Pick<Company, "voice_id" | "voice_enabled">>) => Promise<{ error: any }>;
}

const VOICES: { id: VoiceId; label: string; description: string }[] = [
  { id: "alloy", label: "Alloy", description: "Neutra e equilibrada" },
  { id: "echo", label: "Echo", description: "Masculina, calma" },
  { id: "fable", label: "Fable", description: "Britânica, expressiva" },
  { id: "onyx", label: "Onyx", description: "Masculina, profunda" },
  { id: "nova", label: "Nova", description: "Feminina, jovem" },
  { id: "shimmer", label: "Shimmer", description: "Feminina, suave" },
];

export function AiSettingsCard({ company, canEdit, onUpdate }: AiSettingsCardProps) {
  const { settings, loading, updateSettings } = useAiSettings(company.id);
  const [formData, setFormData] = useState({
    name: "",
    tone: "amigável",
    instructions: "",
  });

  // Voice States
  const [voiceId, setVoiceId] = useState<VoiceId>(company.voice_id);
  const [voiceEnabled, setVoiceEnabled] = useState(company.voice_enabled);
  const [savingVoice, setSavingVoice] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "Atendente Virtual",
        tone: settings.tone || "amigável",
        instructions: settings.instructions || "",
      });
    }
  }, [settings]);

  useEffect(() => {
    setVoiceId(company.voice_id);
    setVoiceEnabled(company.voice_enabled);
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
  };

  const handleSaveVoice = async () => {
    setSavingVoice(true);
    const { error } = await onUpdate({ voice_id: voiceId, voice_enabled: voiceEnabled });
    setSavingVoice(false);
    if (error) toast.error("Erro ao salvar configuração de voz");
    else toast.success("Voz atualizada");
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            voice: voiceId,
            text: `Olá! Eu sou o atendente virtual do projeto ${company.name}. Esta é uma prévia da minha voz.`,
          }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast.error(err.error || "Erro ao gerar prévia");
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (e) {
      toast.error("Erro de conexão ao gerar prévia");
    } finally {
      setPreviewing(false);
    }
  };

  const voiceDirty = voiceId !== company.voice_id || voiceEnabled !== company.voice_enabled;

  if (loading && !settings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Identidade da IA</CardTitle>
              <CardDescription>
                Personalize como o seu agente de inteligência artificial interage com os clientes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-name">Nome da IA</Label>
                <Input
                  id="ai-name"
                  placeholder="Ex: Maya, Atendente Virtual..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-tone">Tom de voz</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                  disabled={!canEdit}
                >
                  <SelectTrigger id="ai-tone">
                    <SelectValue placeholder="Selecione um tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigável">Amigável</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="descontraído">Descontraído</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="entusiasta">Entusiasta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-instructions">Instruções Gerais</Label>
              <Textarea
                id="ai-instructions"
                placeholder="Descreva como a IA deve se comportar, o que deve priorizar e como deve responder aos clientes."
                className="min-h-[150px] resize-none"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                disabled={!canEdit}
              />
              <p className="text-[11px] text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                <strong>Dica:</strong> Seus produtos e serviços serão injetados automaticamente no conhecimento da IA. Você não precisa listá-los aqui.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!canEdit || loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Identidade
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary-foreground">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Voz do Agente</CardTitle>
              <CardDescription>
                Escolha a voz que será usada nas respostas em áudio no WhatsApp.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="voice-enabled" className="text-sm font-medium">
                Responder com áudio automaticamente
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, o agente pode responder em áudio quando o lead enviar mensagem de voz.
              </p>
            </div>
            <Switch
              id="voice-enabled"
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-select" className="text-sm font-medium">
              Selecionar Voz
            </Label>
            <div className="flex gap-2">
              <Select
                value={voiceId}
                onValueChange={(v) => setVoiceId(v as VoiceId)}
                disabled={!canEdit}
              >
                <SelectTrigger id="voice-select" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{v.label}</span>
                        <span className="text-xs text-muted-foreground">— {v.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={previewing}
              >
                {previewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Ouvir prévia</span>
              </Button>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveVoice} disabled={!voiceDirty || savingVoice} className="gap-2">
                {savingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Voz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
