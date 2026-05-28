-- Sandbox sessions table
CREATE TABLE public.sandbox_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'strict',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary jsonb,
  lead_status public.lead_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sandbox_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view sandbox sessions"
ON public.sandbox_sessions FOR SELECT TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

CREATE POLICY "Members can create sandbox sessions"
ON public.sandbox_sessions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
    OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);

CREATE POLICY "Members can update own sandbox sessions"
ON public.sandbox_sessions FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Members can delete own sandbox sessions"
ON public.sandbox_sessions FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER sandbox_sessions_updated_at
BEFORE UPDATE ON public.sandbox_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Allow members to create conversations (needed for "Create contact" from sandbox)
CREATE POLICY "Members can insert company conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);