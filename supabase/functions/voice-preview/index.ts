const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { voice, text } = await req.json();

    if (!voice || !ALLOWED_VOICES.includes(voice)) {
      return new Response(JSON.stringify({ error: "Voz inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input = (text && typeof text === "string" ? text : "Olá! Esta é uma prévia da voz que vai atender seus clientes.").slice(0, 300);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input,
        response_format: "mp3",
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("OpenAI TTS error:", resp.status, t);
      if (resp.status === 401) {
        return new Response(JSON.stringify({ error: "Chave da OpenAI inválida." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 429 || resp.status === 402 || resp.status === 403) {
        return new Response(JSON.stringify({ error: "Sem créditos/quota na OpenAI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao gerar áudio" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await resp.arrayBuffer();
    return new Response(audioBuffer, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (e) {
    console.error("voice-preview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
