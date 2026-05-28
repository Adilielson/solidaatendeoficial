const segments = [
  { icon: "💇", name: "Salão de Beleza", bullets: ["Agendamentos sem perder cliente", "Confirmação automática de horários"] },
  { icon: "🩺", name: "Clínica Médica", bullets: ["Triagem inicial inteligente", "Lembretes de consulta automáticos"] },
  { icon: "✨", name: "Estética", bullets: ["Pré-venda de procedimentos", "Follow-up pós-atendimento"] },
  { icon: "⚖️", name: "Advocacia", bullets: ["Qualificação de novos casos", "Atendimento profissional 24/7"] },
  { icon: "🏋️", name: "Personal Trainer", bullets: ["Captação de alunos no Insta", "Agenda de aulas organizada"] },
  { icon: "🥗", name: "Nutricionista", bullets: ["Reagendamento automático", "Acompanhamento entre consultas"] },
  { icon: "🧠", name: "Psicólogo", bullets: ["Primeiro contato acolhedor", "Sigilo e profissionalismo"] },
  { icon: "🐾", name: "Veterinário", bullets: ["Emergências priorizadas", "Lembrete de vacinas e retornos"] },
];

const ForWhom = () => {
  return (
    <section className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div className="text-center mb-12">
          <h2 className="text-[40px] font-bold leading-[1.2]" style={{ color: "var(--text-headline)", letterSpacing: "-0.5px" }}>
            Para quem é o <span style={{ color: "var(--green-primary)" }}>SolidaAtende</span>?
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55]" style={{ color: "var(--text-muted)" }}>
            Negócios de serviço que precisam atender rápido e converter mais
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl bg-white p-7 transition-all hover:-translate-y-1"
              style={{
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="text-[44px] mb-4 leading-none">{s.icon}</div>
              <h3 className="text-[20px] font-semibold mb-3" style={{ color: "var(--text-headline)" }}>
                {s.name}
              </h3>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[15px] leading-[1.5]" style={{ color: "#666" }}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--green-primary)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
