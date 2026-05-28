-- 1. Enum de papéis da aplicação
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Função has_role (security definer evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Helper is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin'::public.app_role)
$$;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 6. Atribui super_admin ao usuário adilielson@gmail.com (caso exista)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'adilielson@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;