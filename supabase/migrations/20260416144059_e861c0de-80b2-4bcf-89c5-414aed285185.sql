
-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

CREATE POLICY "Members can update company conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view conversation messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM public.conversations
    WHERE company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
       OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  )
);
