import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Quanto tempo leva para configurar?", a: "Em média 5 minutos. Você escaneia o QR Code do WhatsApp, define o fluxo de triagem e a IA já começa a atender." },
  { q: "Preciso ter um número novo de WhatsApp?", a: "Não. Funciona com seu número atual, inclusive WhatsApp Business. Sem precisar trocar nada." },
  { q: "A IA realmente entende meus clientes?", a: "Sim. Treinamos com seu segmento e seus produtos. Você revisa o tom de voz e ajusta sempre que quiser, no painel." },
  { q: "Posso assumir a conversa quando quiser?", a: "Claro. Em qualquer momento você ou seu time pode pausar a IA e continuar manualmente, sem o cliente perceber." },
  { q: "Os dados dos meus clientes ficam seguros?", a: "Total conformidade com a LGPD, criptografia em repouso e em trânsito. Você é dono dos seus dados." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Sem fidelidade, sem multa. Cancela direto no painel a qualquer momento." },
  { q: "Funciona com Instagram também?", a: "Sim, no plano Pro. Atende WhatsApp e Instagram Direct na mesma caixa de entrada unificada." },
  { q: "Tem suporte em português?", a: "100% em português. Time humano respondendo em até 1h em horário comercial." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[800px] px-6 lg:px-20">
        <div className="text-center mb-12">
          <h2 className="text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
            Respondemos as dúvidas mais comuns de quem está chegando agora
          </p>
        </div>

        <div className="rounded-2xl bg-white" style={{ border: "1px solid var(--border-light)", boxShadow: "var(--shadow-card)" }}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={i < faqs.length - 1 ? "border-b" : ""}
                style={{ borderColor: "var(--border-light)" }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[18px] font-semibold" style={{ color: "var(--text-headline)" }}>
                    {f.q}
                  </span>
                  <Plus
                    size={22}
                    className="shrink-0 transition-transform duration-300"
                    style={{
                      color: "var(--green-primary)",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? "300px" : "0" }}
                >
                  <p className="px-6 pb-5 text-[16px] leading-[1.6]" style={{ color: "#666" }}>
                    {f.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
