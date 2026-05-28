import { Clock, Mic, Calendar, MessageCircle, BarChart3, Zap } from "lucide-react";

const features = [
  { icon: Clock, title: "Atendimento 24/7", description: "Sua IA responde no segundo, mesmo às 3h da manhã. Nenhum lead esperando." },
  { icon: Mic, title: "Voz Humanizada", description: "Áudios com voz natural que conversam de verdade — não soa robô." },
  { icon: Calendar, title: "Agendamento Automático", description: "Cliente escolhe horário e a agenda atualiza sozinha. Sem retrabalho." },
  { icon: MessageCircle, title: "Integração WhatsApp", description: "Conecte por QR Code em 60 segundos. Funciona no seu número atual." },
  { icon: BarChart3, title: "Relatórios e Métricas", description: "Veja conversões, leads qualificados e performance em tempo real." },
  { icon: Zap, title: "Configuração em Minutos", description: "Sem código. Sem técnico. Você mesmo configura tudo no painel." },
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="text-center mb-14">
          <h2 className="text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
            Tudo que você precisa para <span style={{ color: "var(--green-primary)" }}>vender no automático</span>
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55] max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Uma plataforma completa, desenhada para negócios que vivem do WhatsApp.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card group rounded-2xl bg-white p-8"
              style={{
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgba(8, 163, 133, 0.1)", color: "var(--green-primary)" }}
              >
                <f.icon size={22} />
              </div>
              <h3 className="mb-3 text-[22px] font-semibold leading-[1.3]" style={{ color: "var(--text-headline)" }}>
                {f.title}
              </h3>
              <p className="text-[16px] leading-[1.55]" style={{ color: "#666" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
