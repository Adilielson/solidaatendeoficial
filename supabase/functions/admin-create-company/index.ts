import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const superAdmins = ["solidaatende@gmail.com", "solidadigital01@gmail.com", "adilielson@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Sem autorização");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (!caller || !superAdmins.map(e => e.toLowerCase()).includes(caller.email?.toLowerCase() || "")) {
      throw new Error("Acesso negado: Apenas Super Admins podem criar empresas.");
    }

    const { name, slug, email, phone, password } = await req.json();

    if (!name || !slug || !email || !password) {
      throw new Error("Dados incompletos (Nome, Slug, E-mail e Senha são obrigatórios)");
    }

    // 1. Check if user already exists to give a better error
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(email);
    // Note: getUserById doesn't work with email, need to list or search
    const { data: { users: foundUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = foundUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (userExists) {
      throw new Error(`O e-mail ${email} já está cadastrado em outra conta.`);
    }

    // 2. Create User (trigger handle_new_user auto-creates a company + membership)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone }
    });

    if (createError) throw createError;
    const userId = newUser.user.id;

    // 3. Update profile with phone and name explicitly
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: name, phone })
      .eq("id", userId);

    // 4. Ensure the user has the 'user' role (not super_admin)
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "user" }, { onConflict: "user_id" });

    // 5. Find the auto-created company and update it with desired name/slug
    // We wait a bit to ensure the trigger finished (though it should be synchronous)
    let autoCompany = null;
    for (let i = 0; i < 5; i++) {
      const { data } = await supabaseAdmin
        .from("companies")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();
      if (data) {
        autoCompany = data;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let companyId: string;

    if (autoCompany) {
      // Avoid slug collisions
      const { data: slugTaken } = await supabaseAdmin
        .from("companies")
        .select("id")
        .eq("slug", slug)
        .neq("id", autoCompany.id)
        .maybeSingle();

      const finalSlug = slugTaken ? `${slug}-${Date.now().toString(36)}` : slug;

      const { error: updateError } = await supabaseAdmin
        .from("companies")
        .update({ name, slug: finalSlug })
        .eq("id", autoCompany.id);

      if (updateError) throw updateError;
      companyId = autoCompany.id;
    } else {
      // Fallback if trigger didn't run
      const { data: company, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({ name, slug, owner_id: userId })
        .select()
        .single();

      if (companyError) throw companyError;
      companyId = company.id;

      await supabaseAdmin
        .from("company_members")
        .insert({ company_id: companyId, user_id: userId, role: "owner" });
    }

    return new Response(
      JSON.stringify({ success: true, companyId, userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: any) {
    console.error("admin-create-company error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});