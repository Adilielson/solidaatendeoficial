import { useEffect, useRef, useState } from "react";
import { Smartphone } from "lucide-react";

type Msg = { from: "user" | "bot"; text: string };

const messages: Msg[] = [
  { from: "user", text: "Oi! Quero agendar um horário" },
  { from: "bot",  text: "Olá! 😊 Qual serviço você precisa?" },
  { from: "user", text: "Corte de cabelo feminino" },
  { from: "bot",  text: "Temos horários amanhã às 14h e 16h. Qual prefere?" },
  { from: "user", text: "Às 14h, por favor!" },
  { from: "bot",  text: "Perfeito! ✅ Agendado para amanhã às 14h. Até lá!" },
];

const ChatDemo = () => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Start animation when section enters viewport
  useEffect(() => {
    const node = chatRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Append messages sequentially
  useEffect(() => {
    if (!started) return;
    const chatEl = chatRef.current;
    if (!chatEl) return;

    let i = 0;
    let cancelled = false;
    const timeouts: number[] = [];

    const reset = () => {
      chatEl.innerHTML = "";
      i = 0;
    };

    const showNext = () => {
      if (cancelled) return;
      if (i >= messages.length) {
        timeouts.push(window.setTimeout(() => {
          if (cancelled) return;
          reset();
          showNext();
        }, 3500));
        return;
      }

      const msg = messages[i++];

      // Typing indicator
      const typing = document.createElement("div");
      typing.className = `chat-bubble chat-${msg.from} show`;
      typing.innerHTML = `<span class="chat-typing"><span></span><span></span><span></span></span>`;
      chatEl.appendChild(typing);
      chatEl.scrollTop = chatEl.scrollHeight;

      timeouts.push(window.setTimeout(() => {
        if (cancelled) return;
        // Replace with real bubble
        chatEl.removeChild(typing);
        const el = document.createElement("div");
        el.className = `chat-bubble chat-${msg.from}`;
        el.textContent = msg.text;
        chatEl.appendChild(el);
        chatEl.scrollTop = chatEl.scrollHeight;
        timeouts.push(window.setTimeout(() => el.classList.add("show"), 30));

        timeouts.push(window.setTimeout(showNext, 1400));
      }, 700));
    };

    timeouts.push(window.setTimeout(showNext, 600));

    return () => {
      cancelled = true;
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [started]);

  return (
    <section className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Texto */}
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[14px] font-semibold"
              style={{
                borderColor: "var(--green-primary)",
                background: "rgba(8, 163, 133, 0.06)",
                color: "var(--green-primary)",
                letterSpacing: "0.3px",
              }}
            >
              <Smartphone size={14} /> Demo ao vivo
            </span>
            <h2 className="mt-6 text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
              Veja a IA <span style={{ color: "var(--green-primary)" }}>em ação</span>
            </h2>
            <p className="mt-5 text-[18px] leading-[1.55]" style={{ color: "#666" }}>
              Uma conversa real entre cliente e a IA do SolidaAtende.
              Tom natural, decisões rápidas e agendamento concluído sem nenhum atendente humano.
            </p>
            <ul className="mt-6 space-y-2 text-[16px] leading-[1.55]" style={{ color: "#555" }}>
              <li>• Resposta em segundos, em qualquer horário</li>
              <li>• Linguagem natural, sem &ldquo;cara de robô&rdquo;</li>
              <li>• Confirma horário e atualiza a sua agenda</li>
            </ul>
          </div>

          {/* WhatsApp mock */}
          <div className="mx-auto w-full max-w-[400px]">
            <div
              className="rounded-3xl bg-white overflow-hidden"
              style={{
                border: "1px solid var(--border-light)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 text-white"
                style={{ background: "var(--green-primary)" }}
              >
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold">SolidaAtende</p>
                  <p className="text-[11px] text-white/80">online</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="chat-window chat-messages" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
