-- Função para criar empresa padrão no signup
CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  base_slug text;
  final_slug text;
  suffix int := 0;
BEGIN
  -- Gera slug base a partir do email
  base_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'empresa';
  END IF;
  final_slug := base_slug;

  -- Garante slug único
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug) LOOP
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix::text;
  END LOOP;

  -- Cria empresa
  INSERT INTO public.companies (name, slug, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), 'Minha Empresa'),
    final_slug,
    NEW.id
  )
  RETURNING id INTO new_company_id;

  -- Adiciona como admin
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (new_company_id, NEW.id, 'admin')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger no signup
DROP TRIGGER IF EXISTS on_auth_user_created_company ON auth.users;
CREATE TRIGGER on_auth_user_created_company
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_company();

-- Garante que o handle_new_user (profile) também esteja como trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Backfill: cria empresa para usuários existentes que ainda não têm
DO $$
DECLARE
  u RECORD;
  new_company_id uuid;
  base_slug text;
  final_slug text;
  suffix int;
BEGIN
  FOR u IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.owner_id = au.id)
      AND NOT EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.user_id = au.id)
  LOOP
    base_slug := lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
    IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'empresa'; END IF;
    final_slug := base_slug;
    suffix := 0;
    WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug) LOOP
      suffix := suffix + 1;
      final_slug := base_slug || '-' || suffix::text;
    END LOOP;

    INSERT INTO public.companies (name, slug, owner_id)
    VALUES (
      COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1), 'Minha Empresa'),
      final_slug,
      u.id
    )
    RETURNING id INTO new_company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (new_company_id, u.id, 'admin')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Garante perfil para usuários existentes
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data ->> 'avatar_url', au.raw_user_meta_data ->> 'picture', '')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;