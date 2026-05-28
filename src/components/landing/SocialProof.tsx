const stats = [
  { target: 2000, prefix: "+", suffix: "", label: "negócios ativos" },
  { target: 98, prefix: "", suffix: "%", label: "de satisfação" },
  { target: 500, prefix: "+", suffix: "k", label: "atendimentos/mês" },
];

const logos = [
  "Belezza", "ClinicMed", "ZenSpa", "Advoga+", "FitLab",
  "NutriPro", "MentorPsi", "PetCare", "Studio One", "Salão Lis",
];

const SocialProof = () => {
  return (
    <section className="bg-white border-y" style={{ borderColor: "var(--border-light)" }}>
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20 py-12">
        {/* Stats with animated counter */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="text-center px-10">
                <p className="text-[40px] font-extrabold leading-none" style={{ color: "var(--green-primary)", letterSpacing: "-0.5px" }}>
                  <span
                    className="counter"
                    data-target={s.target}
                    data-prefix={s.prefix}
                    data-suffix={s.suffix}
                  >
                    {s.prefix}0{s.suffix}
                  </span>
                </p>
                <p className="mt-3 text-[16px]" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden sm:block h-12 w-px" style={{ background: "var(--border-light)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Logos marquee */}
        <div className="mt-12 logos-wrapper">
          <div className="logos-track">
            {[...logos, ...logos].map((name, i) => (
              <span
                key={i}
                className="text-[20px] font-extrabold tracking-tight whitespace-nowrap"
                style={{ color: "#bdb5a3", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
