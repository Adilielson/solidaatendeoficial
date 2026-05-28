const integrations = [
  { name: "WhatsApp Business", emoji: "💬" },
  { name: "Instagram", emoji: "📸" },
  { name: "Telegram", emoji: "✈️" },
  { name: "Mercado Livre", emoji: "🛒" },
  { name: "Shopify", emoji: "🏪" },
  { name: "HubSpot", emoji: "🔶" },
  { name: "Google Sheets", emoji: "📊" },
  { name: "Zapier", emoji: "⚡" },
];

const Integrations = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary">Integrações</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Conecte com suas ferramentas favoritas
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Integração nativa com as principais plataformas do mercado.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30"
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-sm font-medium text-foreground text-center">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
