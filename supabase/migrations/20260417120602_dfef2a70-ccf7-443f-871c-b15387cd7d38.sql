BEGIN;

CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = _company_id
      AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = _company_id
      AND cm.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_company_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "Members can view company members" ON public.company_members;
CREATE POLICY "Members can view company members"
ON public.company_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_company_member(company_id)
);

DROP POLICY IF EXISTS "Admin can add members" ON public.company_members;
CREATE POLICY "Admin can add members"
ON public.company_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_company_admin(company_id)
);

DROP POLICY IF EXISTS "Members can update company members" ON public.company_members;
CREATE POLICY "Members can update company members"
ON public.company_members
FOR UPDATE
TO authenticated
USING (
  public.is_company_admin(company_id)
)
WITH CHECK (
  public.is_company_admin(company_id)
);

DROP POLICY IF EXISTS "Members can delete company members" ON public.company_members;
CREATE POLICY "Members can delete company members"
ON public.company_members
FOR DELETE
TO authenticated
USING (
  public.is_company_admin(company_id)
);

COMMIT;