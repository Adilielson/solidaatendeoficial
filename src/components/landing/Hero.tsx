import { ArrowRight, Play, Check, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

type Msg = { from: "user" | "bot"; text: string };

const heroMessages: Msg[] = [
  { from: "user", text: "Oi! Vocês estão atendendo?" },
  { from: "bot", text: "Olá! 😊 Sim, 24h por dia. Como posso ajudar?" },
  { from: "user", text: "Quero um orçamento" },
  { from: "bot", text: "Claro! Me conta rapidinho o que você precisa ✨" },
];

const Hero = () => {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = chatRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setStarted(true), io.disconnect())),
      { threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

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
      if (i >= heroMessages.length) {
        timeouts.push(window.setTimeout(() => {
          if (cancelled) return;
          reset();
          showNext();
        }, 3500));
        return;
      }

      const msg = heroMessages[i++];
      const typing = document.createElement("div");
      typing.className = `chat-bubble chat-${msg.from} show`;
      typing.innerHTML = `<span class="chat-typing"><span></span><span></span><span></span></span>`;
      chatEl.appendChild(typing);
      chatEl.scrollTop = chatEl.scrollHeight;

      timeouts.push(window.setTimeout(() => {
        if (cancelled) return;
        chatEl.removeChild(typing);
        const el = document.createElement("div");
        el.className = `chat-bubble chat-${msg.from}`;
        el.textContent = msg.text;
        chatEl.appendChild(el);
        chatEl.scrollTop = chatEl.scrollHeight;
        timeouts.push(window.setTimeout(() => el.classList.add("show"), 30));
        timeouts.push(window.setTimeout(showNext, 1300));
      }, 650));
    };

    timeouts.push(window.setTimeout(showNext, 500));
    return () => {
      cancelled = true;
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [started]);

  return (
    <section className="hero-dot-bg relative overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20 pt-12 lg:pt-[72px] pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="anim-hero-left text-center lg:text-left">
            <h1
              className="font-bold leading-[1.05]"
              style={{
                fontSize: "clamp(40px, 5.6vw, 68px)",
                letterSpacing: "-1.5px",
                color: "hsl(var(--landing-headline))",
              }}
            >
              Atenda no <span style={{ color: "hsl(var(--landing-green))" }}>WhatsApp</span> com uma IA que vende de verdade
            </h1>

            <p
              className="mt-6 mx-auto lg:mx-0 max-w-[560px] text-[1.125rem] leading-[1.55]"
              style={{ color: "hsl(var(--landing-body))" }}
            >
              Conecte seu WhatsApp em 1 minuto e deixe a IA qualificar leads, agendar reuniões e fazer follow-up.{" "}
              <strong style={{ color: "hsl(var(--landing-headline))", fontWeight: 600 }}>
                Setup em 60 segundos
              </strong>
              , 24 horas por dia.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="btn-hero-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-semibold text-white"
                style={{ background: "hsl(var(--landing-green))" }}
              >
                Começar Grátis <ArrowRight size={18} />
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-2.5 text-[17px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "hsl(var(--landing-headline))" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border"
                  style={{ borderColor: "hsl(var(--landing-border))" }}
                >
                  <Play size={13} fill="currentColor" className="ml-0.5" />
                </span>
                Ver Como Funciona
              </a>
            </div>

            <div
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-[15px]"
              style={{ color: "hsl(var(--landing-body))" }}
            >
              {["Setup em 60s", "Sem cartão de crédito", "Cancele quando quiser"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check size={14} style={{ color: "hsl(var(--landing-green))" }} strokeWidth={3} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — WhatsApp animated chat mockup */}
          <div className="anim-hero-right relative mx-auto w-full max-w-[440px] lg:mx-0">
            <div
              className="rounded-[28px] bg-white overflow-hidden"
              style={{
                border: "1px solid hsl(var(--landing-border))",
                boxShadow: "0 24px 60px hsl(0 0% 0% / 0.14)",
              }}
            >
              {/* WhatsApp header */}
              <div
                className="flex items-center gap-3 px-5 py-4 text-white"
                style={{ background: "hsl(var(--landing-green))" }}
              >
                <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold">SolidaAtende</p>
                  <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/90 inline-block" />
                    online agora
                  </p>
                </div>
              </div>

              {/* Animated chat */}
              <div ref={chatRef} className="chat-window chat-messages" style={{ height: 380 }} />
            </div>

            {/* Floating badge: 24/7 */}
            <div
              className="float-badge float-1 absolute flex items-center gap-2 rounded-full px-4 py-2.5 text-white"
              style={{
                top: "-14px",
                right: "-10px",
                background: "hsl(0 0% 10%)",
                boxShadow: "var(--landing-shadow-badge)",
              }}
            >
              <Clock size={14} />
              <span className="text-[13px] font-bold">24/7</span>
            </div>

            {/* Floating badge: WhatsApp */}
            <div
              className="float-badge float-2 absolute flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white"
              style={{
                bottom: "-14px",
                left: "-10px",
                background: "hsl(var(--landing-green))",
                boxShadow: "var(--landing-shadow-badge)",
              }}
            >
              <MessageCircle size={14} fill="currentColor" />
              WhatsApp
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
