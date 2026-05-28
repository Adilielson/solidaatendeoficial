import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { label: "Funcionalidades", href: "#features" },
  { label: "Como Funciona", href: "#how" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Preços", href: "#pricing" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b transition-all duration-300"
      style={{
        background: scrolled ? "rgba(240, 235, 224, 0.72)" : "var(--bg-cream)",
        backdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
        borderColor: scrolled ? "rgba(255,255,255,0.25)" : "var(--border-light)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="mx-auto flex h-[88px] max-w-[1600px] items-center justify-between px-6 lg:px-20">
        {/* Logo (large, like agendypro) */}
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "var(--green-primary)" }}
          >
            <Sparkles size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-headline)" }}>
            Solida<span style={{ color: "var(--green-primary)" }}>Atende</span>
          </span>
        </a>

        {/* Center links — generously spaced */}
        <div className="hidden lg:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[1.25rem] font-medium transition-colors hover:opacity-70"
              style={{ color: "var(--text-headline)" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right cluster: Log In + CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border-[1.5px] px-7 py-2.5 text-[16px] font-semibold transition-colors hover:bg-[var(--green-primary)]/5"
            style={{ borderColor: "var(--green-primary)", color: "var(--text-headline)" }}
          >
            Entrar
          </button>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary rounded-full px-7 py-3 text-[14px] font-extrabold uppercase tracking-[0.5px] text-white shadow-sm"
            style={{ background: "var(--green-primary)" }}
          >
            Começar Agora
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          style={{ color: "var(--text-headline)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t px-6 py-4" style={{ background: "var(--bg-cream)", borderColor: "var(--border-light)" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-[14px] font-medium"
              style={{ color: "var(--text-headline)" }}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => { setMobileOpen(false); navigate("/login"); }}
              className="rounded-full border-[1.5px] px-5 py-2 text-[14px] font-semibold"
              style={{ borderColor: "var(--green-primary)", color: "var(--text-headline)" }}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMobileOpen(false); navigate("/login"); }}
              className="rounded-full px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.5px] text-white"
              style={{ background: "var(--green-primary)" }}
            >
              Começar Agora
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
