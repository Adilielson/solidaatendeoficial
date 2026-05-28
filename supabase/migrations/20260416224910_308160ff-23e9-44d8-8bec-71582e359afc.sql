-- 1. Helper SECURITY DEFINER (evita recursão e centraliza checagem)
CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = _company_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. companies: UPDATE owner+admin (substitui "Owner can update company")
DROP POLICY IF EXISTS "Owner can update company" ON public.companies;
CREATE POLICY "Owner or admin can update company"
ON public.companies
FOR UPDATE
TO authenticated
USING (public.is_company_admin(id));

-- 3. followup_logs: SELECT apenas owner+admin
DROP POLICY IF EXISTS "Members can view followup logs" ON public.followup_logs;
CREATE POLICY "Owner or admin can view followup logs"
ON public.followup_logs
FOR SELECT
TO authenticated
USING (public.is_company_admin(company_id));

-- 4. conversations: UPDATE restrito a atribuído + owner/admin
DROP POLICY IF EXISTS "Members can update company conversations" ON public.conversations;
CREATE POLICY "Assigned agent or admin can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
  public.is_company_admin(company_id)
  OR assigned_to = auth.uid()
);

-- 5. CHECK constraint: máximo 2 tentativas
ALTER TABLE public.conversations
  ADD CONSTRAINT followup_count_max_2
  CHECK (followup_count >= 0 AND followup_count <= 2);