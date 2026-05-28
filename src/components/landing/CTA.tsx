import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroPortrait from "@/assets/hero-portrait.jpg";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-[100px]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20">
        <div
          className="overflow-hidden rounded-3xl"
          style={{ background: "var(--green-primary)" }}
        >
          <div className="grid lg:grid-cols-5 items-center">
            {/* Texto — 60% */}
            <div className="lg:col-span-3 p-10 lg:p-16">
              <h2 className="text-white font-bold leading-[1.15]" style={{ fontSize: "clamp(32px, 4.2vw, 48px)", letterSpacing: "-0.5px" }}>
                Pronto para Automatizar Seu Negócio?
              </h2>
              <p className="mt-5 text-[20px] leading-[1.5] text-white/80 max-w-lg">
                Comece grátis em menos de 60 segundos. Sem cartão, sem instalação, sem técnico.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[17px] font-semibold transition-transform hover:scale-[1.02]"
                  style={{ color: "var(--green-primary)" }}
                >
                  Começar Agora <ArrowRight size={18} />
                </button>
                <button className="rounded-full border-2 border-white/30 px-8 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-white/10">
                  Falar com Vendas
                </button>
              </div>
            </div>

            {/* Foto — 40% */}
            <div className="hidden lg:block lg:col-span-2 h-full min-h-[360px] relative">
              <img
                src={heroPortrait}
                alt="Atendimento humanizado e profissional"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                width={1024}
                height={1024}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, var(--green-primary) 0%, transparent 30%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
