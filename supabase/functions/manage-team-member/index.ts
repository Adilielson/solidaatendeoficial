import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = claims.claims.sub;

    const body = await req.json();
    const { action, company_id, full_name, email, password, phone, role } = body;

    if (!action || !company_id) {
      return new Response(JSON.stringify({ error: "Missing action or company_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is member of this company
    const { data: membership } = await supabaseUser
      .from("company_members")
      .select("id")
      .eq("company_id", company_id)
      .eq("user_id", callerUserId)
      .maybeSingle();

    if (!membership) {
      const { data: ownership } = await supabaseUser
        .from("companies")
        .select("id")
        .eq("id", company_id)
        .eq("owner_id", callerUserId)
        .maybeSingle();

      if (!ownership) {
        return new Response(JSON.stringify({ error: "Not a member of this company" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "create") {
      if (!email || !password || !full_name) {
        return new Response(JSON.stringify({ error: "Missing email, password, or full_name" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone: phone || null },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile phone if provided
      if (phone) {
        await supabaseAdmin
          .from("profiles")
          .update({ phone })
          .eq("id", newUser.user.id);
      }

      // Add to company
      const { error: memberError } = await supabaseAdmin
        .from("company_members")
        .insert({
          company_id,
          user_id: newUser.user.id,
          role: role || "agent",
        });

      if (memberError) {
        return new Response(JSON.stringify({ error: memberError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
