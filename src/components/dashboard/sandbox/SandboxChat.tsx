import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, RotateCcw, Loader2, AlertCircle, Mic, Square, Trash2, Play, Pause } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMsg, SandboxMode } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

type Props = {
  messages: ChatMsg[];
  streaming: boolean;
  mode: SandboxMode;
  onModeChange: (m: SandboxMode) => void;
  onSend: (text: string, type?: "text" | "audio") => void;
  onReset: () => void;
  companyName: string;
  error: string | null;
  disabled: boolean;
  finished: boolean;
};

export function SandboxChat({
  messages, streaming, mode, onModeChange, onSend, onReset,
  companyName, error, disabled, finished,
}: Props) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioBlob(null);
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingDuration(0);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSendAudio = () => {
    if (audioBlob) {
      onSend("(Áudio enviado - Simulação de transcrição)", "audio");
      discardRecording();
    }
  };

  const togglePlayAudio = () => {
    if (!audioBlob) return;
    
    if (!audioPreviewRef.current) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audioPreviewRef.current = audio;
    }

    if (isPlaying) {
      audioPreviewRef.current.pause();
    } else {
      audioPreviewRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const handleSend = () => {
    if (!input.trim() || streaming || disabled || finished) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{companyName} • IA</p>
          <p className="text-xs text-muted-foreground">
            {streaming ? "digitando..." : "Sandbox de testes"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
          <button
            onClick={() => onModeChange("strict")}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              mode === "strict" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            disabled={messages.length > 0}
          >
            Estrito
          </button>
          <button
            onClick={() => onModeChange("free")}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              mode === "free" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            disabled={messages.length > 0}
          >
            Livre
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={messages.length === 0}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reiniciar
        </Button>
      </div>

      {/* Messages — WhatsApp-ish background */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
            <Bot className="h-12 w-12 text-primary/40" />
            <p className="text-sm font-medium">Inicie a conversa para testar o agente</p>
            <p className="text-xs">Envie uma mensagem como se fosse um lead chegando pelo WhatsApp.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border rounded-bl-sm"
              )}
            >
              {m.type === "audio" && (
                <div className="flex items-center gap-2 mb-1 opacity-80">
                  <Mic className="h-3 w-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Mensagem de Voz</span>
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5">
                <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        {finished ? (
          <div className="text-center text-xs text-muted-foreground py-2">
            <Badge variant="outline" className="mb-1">Triagem concluída</Badge>
            <p>Use "Reiniciar" para testar novamente.</p>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {isRecording || audioBlob ? (
              <div className="flex-1 flex items-center bg-muted/50 rounded-full px-4 py-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                  onClick={discardRecording}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 flex items-center justify-center gap-2">
                  {isRecording ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
                    </>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={togglePlayAudio}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-sm"
                  onClick={isRecording ? stopRecording : handleSendAudio}
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={disabled ? "Configure um fluxo de triagem primeiro" : "Digite uma mensagem..."}
                  disabled={streaming || disabled}
                />
                {input.trim() || streaming ? (
                  <Button onClick={handleSend} disabled={streaming || !input.trim() || disabled} size="icon">
                    {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording} 
                    disabled={streaming || disabled} 
                    size="icon"
                    variant="secondary"
                    className="rounded-full"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
