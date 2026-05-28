-- 1) Remover empresas duplicadas (manter apenas a mais antiga por owner)
WITH ranked AS (
  SELECT id, owner_id,
         ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at ASC) AS rn
  FROM public.companies
)
DELETE FROM public.companies
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2) Atualizar handle_new_user para NÃO criar empresa se o usuário já tem uma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
  v_full_name text;
  v_company_name text;
  v_base_slug text;
  v_slug text;
  v_suffix int := 0;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  -- 1) profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2) Se o usuário já tem empresa (owner ou membro), não cria outra
  IF EXISTS (SELECT 1 FROM public.companies WHERE owner_id = NEW.id)
     OR EXISTS (SELECT 1 FROM public.company_members WHERE user_id = NEW.id) THEN
    -- garantir role default e sair
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  -- 3) Empresa inicial
  v_company_name := COALESCE(NULLIF(v_full_name, ''), 'Minha Empresa');
  v_base_slug := regexp_replace(lower(unaccent_safe(v_company_name)), '[^a-z0-9]+', '-', 'g');
  v_base_slug := trim(both '-' from v_base_slug);
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'empresa';
  END IF;
  v_slug := v_base_slug;

  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = v_slug) LOOP
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix::text;
  END LOOP;

  INSERT INTO public.companies (name, slug, owner_id)
  VALUES (v_company_name, v_slug, NEW.id)
  RETURNING id INTO v_company_id;

  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (v_company_id, NEW.id, 'admin'::company_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3) Garantir UNIQUE para evitar múltiplos owners da mesma pessoa
CREATE UNIQUE INDEX IF NOT EXISTS companies_owner_id_unique ON public.companies(owner_id);