import { Sparkles, Mail, MessageCircle, Instagram, Linkedin } from "lucide-react";

const cols = [
  {
    title: "Produto",
    links: ["Funcionalidades", "Como Funciona", "Preços", "Depoimentos"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Blog", "Termos de Uso", "Política de Privacidade"],
  },
];

const Footer = () => {
  return (
    <footer className="text-white" style={{ background: "var(--green-primary)" }}>
      <div className="mx-auto max-w-[1600px] px-6 lg:px-20 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + tagline */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-lg font-extrabold">SolidaAtende</span>
            </div>
            <p className="text-[14px] leading-relaxed text-white/80">
              Atendimento inteligente no WhatsApp para negócios que querem crescer sem perder o toque humano.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-[14px] font-bold uppercase tracking-wider">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] text-white/80 transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contato */}
          <div>
            <h4 className="mb-4 text-[14px] font-bold uppercase tracking-wider">Contato</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:contato@solidaatende.com" className="inline-flex items-center gap-2 text-[14px] text-white/80 hover:text-white">
                  <Mail size={14} /> contato@solidaatende.com
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 text-[14px] text-white/80 hover:text-white">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              {[Instagram, Linkedin, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
                  aria-label="Rede social"
                >
                  <Icon size={15} className="text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-8 sm:flex-row">
          <p className="text-[12px] text-white/70">
            © 2025 SolidaAtende. Todos os direitos reservados.
          </p>
          <p className="text-[12px] text-white/70">
            Feito com 💚 por{" "}
            <a href="https://www.solida.digital/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              Solida Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
