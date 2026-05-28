-- triage_flows policies
ALTER TABLE public.triage_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view company flows" ON public.triage_flows;
CREATE POLICY "Members can view company flows"
ON public.triage_flows FOR SELECT TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can insert company flows" ON public.triage_flows;
CREATE POLICY "Members can insert company flows"
ON public.triage_flows FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can update company flows" ON public.triage_flows;
CREATE POLICY "Members can update company flows"
ON public.triage_flows FOR UPDATE TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can delete company flows" ON public.triage_flows;
CREATE POLICY "Members can delete company flows"
ON public.triage_flows FOR DELETE TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

DROP TRIGGER IF EXISTS triage_flows_updated_at ON public.triage_flows;
CREATE TRIGGER triage_flows_updated_at
BEFORE UPDATE ON public.triage_flows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- triage_steps policies (via flow ownership)
ALTER TABLE public.triage_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view company steps" ON public.triage_steps;
CREATE POLICY "Members can view company steps"
ON public.triage_steps FOR SELECT TO authenticated
USING (
  flow_id IN (
    SELECT id FROM public.triage_flows
    WHERE company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
       OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Members can insert company steps" ON public.triage_steps;
CREATE POLICY "Members can insert company steps"
ON public.triage_steps FOR INSERT TO authenticated
WITH CHECK (
  flow_id IN (
    SELECT id FROM public.triage_flows
    WHERE company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
       OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Members can update company steps" ON public.triage_steps;
CREATE POLICY "Members can update company steps"
ON public.triage_steps FOR UPDATE TO authenticated
USING (
  flow_id IN (
    SELECT id FROM public.triage_flows
    WHERE company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
       OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Members can delete company steps" ON public.triage_steps;
CREATE POLICY "Members can delete company steps"
ON public.triage_steps FOR DELETE TO authenticated
USING (
  flow_id IN (
    SELECT id FROM public.triage_flows
    WHERE company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
       OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);