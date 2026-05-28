import { ArrowRight, Smartphone, Settings, Rocket } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Smartphone,
    title: "Conecte o WhatsApp",
    desc: "Escaneie o QR Code com seu celular. Em 60 segundos sua conta está pronta para receber mensagens.",
  },
  {
    n: "02",
    icon: Settings,
    title: "Monte o fluxo",
    desc: "Defina perguntas de triagem, gatilhos e regras de qualificação. Tudo no-code, arrastando e soltando.",
  },
  {
    n: "03",
    icon: Rocket,
    title: "IA atende sozinha",
    desc: "A partir daí, a IA qualifica leads, agenda reuniões e faz follow-up. Você só recebe o que importa.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="text-center mb-14">
          <h2 className="text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
            Configure em 5 Minutos. <span style={{ color: "var(--green-primary)" }}>Sério.</span>
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
            Sem técnicos, sem complicação. Em 3 passos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl bg-white p-9"
              style={{
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p className="text-[56px] font-extrabold leading-none" style={{ color: "var(--green-primary)", letterSpacing: "-1px" }}>
                {s.n}
              </p>
              <div
                className="mt-6 mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgba(8, 163, 133, 0.1)", color: "var(--green-primary)" }}
              >
                <s.icon size={22} />
              </div>
              <h3 className="text-[22px] font-semibold mb-3 leading-[1.3]" style={{ color: "var(--text-headline)" }}>
                {s.title}
              </h3>
              <p className="text-[16px] leading-[1.55] mb-5" style={{ color: "#666" }}>
                {s.desc}
              </p>
              <button
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--green-primary)" }}
              >
                Saiba mais <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
