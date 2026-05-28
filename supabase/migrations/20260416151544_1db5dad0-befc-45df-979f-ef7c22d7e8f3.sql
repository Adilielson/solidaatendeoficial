
-- Allow company members to update other members' roles within same company
CREATE POLICY "Members can update company members"
ON public.company_members FOR UPDATE
TO authenticated
USING (
  company_id IN (SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid())
  OR company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_id = auth.uid())
);

-- Allow company members to remove members from same company
CREATE POLICY "Members can delete company members"
ON public.company_members FOR DELETE
TO authenticated
USING (
  company_id IN (SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid())
  OR company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_id = auth.uid())
);

-- Allow viewing profiles of members in same company (for avatar, phone display)
CREATE POLICY "Members can view company member profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT cm2.user_id FROM public.company_members cm2
    WHERE cm2.company_id IN (
      SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid()
    )
  )
  OR id IN (
    SELECT c.owner_id FROM public.companies c
    WHERE c.id IN (SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid())
  )
  OR id = auth.uid()
);
