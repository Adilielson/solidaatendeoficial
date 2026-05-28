import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Rodrigues",
    role: "CEO, TechStore",
    avatar: "A",
    text: "Aumentamos nossas vendas em 40% no primeiro mês. A IA responde instantaneamente e nossos clientes adoram.",
    stars: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Gerente, ClinicaPro",
    avatar: "C",
    text: "Reduzimos o tempo de resposta de 30 minutos para menos de 1 minuto. Nosso NPS subiu de 7 para 9.2.",
    stars: 5,
  },
  {
    name: "Juliana Costa",
    role: "Fundadora, EduClass",
    avatar: "J",
    text: "Setup foi ridiculamente rápido. Em 5 minutos já estávamos atendendo alunos pelo WhatsApp com IA.",
    stars: 5,
  },
  {
    name: "Ricardo Alves",
    role: "Diretor, ImovelFácil",
    avatar: "R",
    text: "Gerenciar 8 atendentes nunca foi tão simples. Os relatórios me dão visão total da operação.",
    stars: 5,
  },
  {
    name: "Fernanda Lima",
    role: "COO, FoodDelivery",
    avatar: "F",
    text: "A integração multicanal é perfeita. Atendemos WhatsApp, Instagram e Telegram sem trocar de tela.",
    stars: 5,
  },
  {
    name: "Bruno Santos",
    role: "CTO, SaaSBrasil",
    avatar: "B",
    text: "O CRM integrado substituiu 3 ferramentas que usávamos antes. Economia de R$2.000/mês.",
    stars: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary">Depoimentos</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Quem usa, recomenda
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Mais de 2.000 empresas já transformaram seu atendimento com o SolidaAtende.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
