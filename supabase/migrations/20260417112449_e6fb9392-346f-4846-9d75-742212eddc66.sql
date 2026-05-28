
-- Atualiza handle_new_user para criar profile + empresa + membership + role
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

  -- 2) Empresa inicial
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

  -- 3) Membership como admin
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (v_company_id, NEW.id, 'admin'::company_role)
  ON CONFLICT DO NOTHING;

  -- 4) Role default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Helper: unaccent seguro caso extensão não exista
CREATE OR REPLACE FUNCTION public.unaccent_safe(txt text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN translate(
    txt,
    'áàâãäåÁÀÂÃÄÅéèêëÉÈÊËíìîïÍÌÎÏóòôõöÓÒÔÕÖúùûüÚÙÛÜçÇñÑ',
    'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUcCnN'
  );
END;
$$;

-- Recria o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
