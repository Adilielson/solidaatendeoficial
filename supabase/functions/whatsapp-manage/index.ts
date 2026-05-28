import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const UAZAPI_API_TOKEN_ENV = Deno.env.get("UAZAPI_API_TOKEN");
const UAZAPI_CREATE_URL_ENV = Deno.env.get("UAZAPI_CREATE_URL");

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function sanitize(inst: Record<string, unknown> | null) {
  if (!inst) return null;
  const { instance_token: _it, token_label: _tl, ...rest } = inst as any;
  return rest;
}

function getUazApiBaseUrl(rawUrl: string) {
  const parsed = new URL(rawUrl.trim());
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");

  const instancePathIndex = parsed.pathname.toLowerCase().indexOf("/instance");
  if (instancePathIndex >= 0) {
    parsed.pathname = parsed.pathname.slice(0, instancePathIndex);
  }

  return parsed.toString().replace(/\/+$/, "");
}

async function getCompanyId(authClient: ReturnType<typeof createClient>, userId: string) {
  const { data: m } = await authClient
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (m?.company_id) return m.company_id as string;
  const { data: o } = await authClient
    .from("companies")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  return (o?.id as string) ?? null;
}

async function handleGetOrCreate(admin: any, companyId: string) {
  // Buscar config da empresa para ver se tem token/url customizado
  const { data: company } = await admin
    .from("companies")
    .select("uazapi_admin_token, uazapi_server_url")
    .eq("id", companyId)
    .maybeSingle();

  const adminToken = company?.uazapi_admin_token || UAZAPI_API_TOKEN_ENV;
  const baseUrlEnv = company?.uazapi_server_url || UAZAPI_CREATE_URL_ENV;

  const { data: existing } = await admin
    .from("whatsapp_instances")
    .select("*")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { instance: sanitize(existing), is_new: false };
  }

  if (!adminToken || !baseUrlEnv) {
    throw new Error("Configurações da UazAPI não encontradas (Token ou URL)");
  }

  const instanceName = `solida-${Date.now()}`;
  const baseHost = getUazApiBaseUrl(baseUrlEnv);
  const createUrl = `${baseHost}/instance/init`;

  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      admintoken: adminToken,
    },
    body: JSON.stringify({
      name: instanceName,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Falha ao criar instância [${createRes.status}]: ${body}`);
  }

  const created = await createRes.json();
  // UazAPI retorna { token, name, ... } onde "token" é o token da instância
  const serverUrl = created.server_url ?? created.serverUrl ?? baseHost;
  const instanceToken =
    created.token ?? created["Instance Token"] ?? created.instance_token;
  const tokenLabel = created.name ?? instanceName;

  if (!serverUrl || !instanceToken) {
    throw new Error("Resposta da API inválida (sem server_url ou instance_token)");
  }

  const webhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook?company_id=${companyId}`;

  // Register webhook (non-blocking)
  try {
    await fetch(`${serverUrl}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: instanceToken },
      body: JSON.stringify({
        url: webhookUrl,
        enabled: true,
        events: ["connection", "messages"],
      }),
    });
  } catch (e) {
    console.error("Webhook registration failed:", e);
  }

  const { data: inserted, error: insErr } = await admin
    .from("whatsapp_instances")
    .insert({
      company_id: companyId,
      instance_name: instanceName,
      server_url: serverUrl,
      instance_token: instanceToken,
      token_label: tokenLabel,
      webhook_url: webhookUrl,
      status: "pending",
      is_connected: false,
    })
    .select()
    .single();

  if (insErr) throw new Error(`Erro ao salvar instância: ${insErr.message}`);

  return { instance: sanitize(inserted), is_new: true };
}

async function handleQrCode(admin: any, companyId: string) {
  const { data: inst } = await admin
    .from("whatsapp_instances")
    .select("*")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle();

  if (!inst) throw new Error("Instância não encontrada");

  const qrRes = await fetch(`${inst.server_url}/instance/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", token: inst.instance_token },
    body: JSON.stringify({}),
  });

  if (!qrRes.ok) {
    const body = await qrRes.text();
    throw new Error(`Falha ao buscar QR Code [${qrRes.status}]: ${body}`);
  }

  const data = await qrRes.json();
  const isConnected = data.connected === true || data?.instance?.status === "connected";

  if (isConnected) {
    await admin
      .from("whatsapp_instances")
      .update({
        status: "connected",
        is_connected: true,
        last_connection_at: new Date().toISOString(),
      })
      .eq("id", inst.id);
    return { connected: true, qrcode: "" };
  }

  const qrcode = data?.instance?.qrcode ?? data?.qrcode ?? "";
  await admin
    .from("whatsapp_instances")
    .update({ status: "pending", is_connected: false })
    .eq("id", inst.id);

  return { connected: false, qrcode };
}

async function handleDisconnect(admin: any, companyId: string) {
  const { error } = await admin
    .from("whatsapp_instances")
    .update({ status: "disconnected", is_connected: false })
    .eq("company_id", companyId);
  if (error) throw new Error(error.message);
  return { success: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    let userId: string | null = null;

    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userRes } = await userClient.auth.getUser();
      userId = userRes?.user?.id ?? null;
    }

    const { action, companyId: bodyCompanyId } = await req.json();
    
    let companyId = bodyCompanyId;
    if (!companyId && userId) {
      companyId = await getCompanyId(admin, userId);
    }

    if (!companyId) return json({ error: "Empresa não identificada" }, 404);

    if (action === "get-or-create") return json(await handleGetOrCreate(admin, companyId));
    if (action === "qrcode") return json(await handleQrCode(admin, companyId));
    if (action === "disconnect") return json(await handleDisconnect(admin, companyId));

    return json({ error: "Ação inválida" }, 400);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("whatsapp-manage error:", msg);
    if (msg.startsWith("Falha ao criar instância") || msg.startsWith("Falha ao buscar QR Code")) {
      return json({ error: msg, fallback: true }, 200);
    }
    return json({ error: msg }, 500);
  }
});
