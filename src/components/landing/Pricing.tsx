import { Check, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Plan = {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "R$ 97",
    tagline: "Para quem está começando",
    features: [
      "1 número WhatsApp",
      "Atendimento 24/7 com IA",
      "500 conversas/mês",
      "Triagem no-code",
      "Relatórios básicos",
    ],
    cta: "Começar agora",
  },
  {
    name: "Pro",
    price: "R$ 297",
    tagline: "O mais escolhido por PMEs",
    features: [
      "1 número WhatsApp",
      "Conversas ilimitadas",
      "Voz humanizada (áudios)",
      "Agendamento automático",
      "Follow-up de leads frios",
      "Relatórios em tempo real",
      "Suporte humano",
    ],
    highlight: true,
    badge: "Mais Popular",
    cta: "Começar agora",
  },
  {
    name: "Enterprise",
    price: "R$ 697",
    tagline: "Para times e operações grandes",
    features: [
      "Múltiplos números WhatsApp",
      "Conversas ilimitadas",
      "Equipe com vários atendentes",
      "API e integrações customizadas",
      "Onboarding dedicado",
      "Suporte prioritário",
    ],
    cta: "Falar com vendas",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="text-center mb-14">
          <h2
            className="text-[40px] font-bold leading-[1.2]"
            style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}
          >
            Preço Justo. <span style={{ color: "var(--green-primary)" }}>Funcionalidade Completa.</span>
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
            Planos simples. Sem letras miúdas, sem surpresas.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-[1200px] mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-[20px] bg-white p-8 lg:p-10 flex flex-col"
              style={{
                border: plan.highlight ? "2px solid var(--green-primary)" : "1px solid var(--border-light)",
                boxShadow: plan.highlight
                  ? "0 20px 50px rgba(8, 163, 133, 0.15)"
                  : "var(--shadow-card)",
                transform: plan.highlight ? "translateY(-8px)" : "none",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[12px] font-bold text-white whitespace-nowrap"
                  style={{ background: "var(--green-primary)" }}
                >
                  {plan.badge}
                </span>
              )}

              <div className="text-center mb-6">
                <p
                  className="text-[14px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: plan.highlight ? "var(--green-primary)" : "var(--text-muted)" }}
                >
                  Plano {plan.name}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className="text-[52px] font-extrabold leading-none"
                    style={{ color: "var(--text-headline)", letterSpacing: "-1.5px" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[16px]" style={{ color: "var(--text-muted)" }}>
                    /mês
                  </span>
                </div>
                <p className="mt-3 text-[14px]" style={{ color: "var(--text-muted)" }}>
                  {plan.tagline}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-[15px] leading-[1.5]"
                    style={{ color: "var(--text-headline)" }}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "var(--green-light)", color: "var(--green-primary)" }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/login")}
                className="btn-primary w-full rounded-full py-3.5 text-[16px] font-semibold transition-all"
                style={{
                  background: plan.highlight ? "var(--green-primary)" : "transparent",
                  color: plan.highlight ? "#fff" : "var(--green-primary)",
                  border: plan.highlight ? "none" : "2px solid var(--green-primary)",
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex items-center justify-center gap-2 text-[15px]"
          style={{ color: "var(--text-muted)" }}
        >
          <Shield size={14} style={{ color: "var(--green-primary)" }} />
          7 dias de garantia ou seu dinheiro de volta • Sem fidelidade
        </div>
      </div>
    </section>
  );
};

export default Pricing;
