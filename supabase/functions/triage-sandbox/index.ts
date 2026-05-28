import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Step {
  id: string;
  question: string;
  field_type: "text" | "list";
  is_required: boolean;
  options: string[] | null;
  conclusion_action: "transfer" | "schedule" | "discard" | null;
  order_position: number;
}

interface BodyShape {
  messages: { role: "user" | "assistant"; content: string }[];
  mode: "strict" | "free";
  flow_steps: Step[];
  company_name: string;
  company_id?: string;
}

async function buildSystemPrompt(body: BodyShape, supabase: any) {
  const { mode, flow_steps, company_name, company_id } = body;
  
  // 1. Fetch AI Settings
  let aiName = "Atendente Virtual";
  let aiTone = "amigável";
  let aiInstructions = "";
  
  if (company_id) {
    const { data: aiSettings } = await supabase
      .from("ai_settings")
      .select("name, tone, instructions")
      .eq("company_id", company_id)
      .maybeSingle();
      
    if (aiSettings) {
      aiName = aiSettings.name || aiName;
      aiTone = aiSettings.tone || aiTone;
      aiInstructions = aiSettings.instructions || "";
    }
  }

  // 2. Fetch Products
  let productsText = "";
  if (company_id) {
    const { data: products } = await supabase
      .from("products")
      .select("name, description, price")
      .eq("company_id", company_id)
      .eq("is_active", true);

    if (products && products.length > 0) {
      productsText = "\n\nNOSSO CATÁLOGO DE PRODUTOS/SERVIÇOS:\n" + 
        products.map((p: any) => `- ${p.name}: ${p.description || "Sem descrição"}. Preço: R$ ${p.price}`).join("\n");
    }
  }

  const stepsText = flow_steps
    .sort((a, b) => a.order_position - b.order_position)
    .map((s, i) => {
      let opts = "";
      if (s.field_type === "list" && s.options?.length) {
        const numbered = s.options.map((o, idx) => `${idx + 1} - ${o}`).join("\n");
        opts = `\n   OPÇÕES (copie exatamente no texto da resposta, uma por linha):\n${numbered}`;
      }
      const req = s.is_required ? " [obrigatório]" : "";
      const concl = s.conclusion_action ? ` [ação ao concluir: ${s.conclusion_action}]` : "";
      return `${i + 1}. id=${s.id} | ${s.question}${req}${concl}${opts}`;
    })
    .join("\n");

  const base = `Você é ${aiName}, um agente de atendimento com tom ${aiTone} da empresa "${company_name}".
Você está testando o fluxo de triagem em modo SANDBOX (uma simulação para o operador validar o agente).

${aiInstructions ? `INSTRUÇÕES ADICIONAIS:\n${aiInstructions}\n` : ""}
${productsText}

Fluxo de triagem ativo:
${stepsText || "(nenhuma etapa configurada)"}

Regras:
- Use português brasileiro, tom ${aiTone}, mensagens curtas (estilo WhatsApp).
- Cumprimente apenas na primeira mensagem.
- Para campos do tipo "list", SEMPRE responda neste formato exato, sem variações:
  Pergunta da etapa
  Opções:
  1 - Nome da opção
  2 - Nome da opção
  3 - Nome da opção
  Responda apenas com o número.
- NUNCA liste opções sem numeração.
- NUNCA troque a ordem recebida nas opções.
- NUNCA adicione uma segunda pergunta extra depois da lista.
- Aceite a resposta do lead tanto pelo número quanto pelo texto da opção. Ao registrar, salve o nome completo da opção escolhida.
- Valide cada resposta: se inválida ou ambígua, peça esclarecimento educadamente sem avançar.
- Quando tiver respostas para todas as etapas relevantes (ou quando determinar que o lead deve ser descartado/transferido antes), CHAME a função finalize_triage com o resumo. Não envie a resposta como texto também — apenas chame a função.`;

  if (mode === "strict") {
    return `${base}

MODO ESTRITO: Faça as perguntas RIGOROSAMENTE na ordem listada acima, uma por vez. Não pule nem agrupe perguntas. Para perguntas do tipo lista, copie exatamente a lista numerada fornecida no fluxo.`;
  }
  return `${base}

MODO LIVRE: Conduza uma conversa natural, mas certifique-se de cobrir todos os tópicos do fluxo. Pode reordenar e combinar perguntas se for natural. Para perguntas do tipo lista, copie exatamente a lista numerada fornecida no fluxo.`;
}

const finalizeTool = {
  type: "function",
  function: {
    name: "finalize_triage",
    description: "Chame quando a triagem estiver concluída — quando tiver respostas suficientes ou decidir descartar/transferir o lead.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["qualified", "discarded", "transfer"],
          description: "qualified=lead bom; discarded=não atende requisitos; transfer=encaminhar para humano",
        },
        reasoning: { type: "string", description: "Justificativa curta da decisão (1-2 frases)" },
        answers: {
          type: "array",
          description: "Respostas coletadas, mapeadas por step_id",
          items: {
            type: "object",
            properties: {
              step_id: { type: "string" },
              question: { type: "string" },
              answer: { type: "string" },
            },
            required: ["step_id", "question", "answer"],
            additionalProperties: false,
          },
        },
        contact_name: { type: "string", description: "Nome do lead se mencionado, senão vazio" },
        contact_phone: { type: "string", description: "Telefone do lead se mencionado, senão vazio" },
        contact_email: { type: "string", description: "Email do lead se mencionado, senão vazio" },
      },
      required: ["status", "reasoning", "answers"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as BodyShape;
    if (!Array.isArray(body.messages) || !Array.isArray(body.flow_steps)) {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = await buildSystemPrompt(body, supabase);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...body.messages,
        ],
        tools: [finalizeTool],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições da IA atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione saldo no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Credenciais da IA inválidas." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao chamar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("triage-sandbox error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
