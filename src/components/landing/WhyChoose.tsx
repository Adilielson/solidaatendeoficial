import { Check } from "lucide-react";

const items = [
  "100% dos leads atendidos em segundos",
  "IA trabalha 24/7, você descansa",
  "Atendimento humanizado com voz",
  "Clientes impressionados com profissionalismo",
  "Foca no que importa: seu trabalho",
];

const WhyChoose = () => {
  return (
    <section className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="text-center mb-12">
          <h2 className="text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
            Por que escolher <span style={{ color: "var(--green-primary)" }}>SolidaAtende</span>?
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
            O que muda na sua operação a partir do dia 1
          </p>
        </div>

        <div
          className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-10 lg:p-12"
          style={{
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <span
            className="absolute -top-3 right-6 rounded-full px-4 py-1.5 text-[13px] font-bold text-white"
            style={{ background: "var(--green-primary)" }}
          >
            Recomendado
          </span>

          <h3 className="text-[24px] font-semibold mb-6" style={{ color: "var(--text-headline)" }}>
            Com SolidaAtende
          </h3>

          <ul className="space-y-4">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-3 text-[17px] leading-[1.5]" style={{ color: "var(--text-headline)" }}>
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--green-light)", color: "var(--green-primary)" }}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
