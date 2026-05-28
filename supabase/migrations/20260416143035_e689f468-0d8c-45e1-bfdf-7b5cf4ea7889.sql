
-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('unclassified', 'qualified', 'discarded');

-- Add lead_status column to contacts
ALTER TABLE public.contacts ADD COLUMN lead_status public.lead_status NOT NULL DEFAULT 'unclassified';

-- RLS policies for contacts (company members can CRUD their company's contacts)
CREATE POLICY "Members can view company contacts"
ON public.contacts FOR SELECT
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
) OR company_id IN (
  SELECT id FROM public.companies WHERE owner_id = auth.uid()
));

CREATE POLICY "Members can insert company contacts"
ON public.contacts FOR INSERT
TO authenticated
WITH CHECK (company_id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
) OR company_id IN (
  SELECT id FROM public.companies WHERE owner_id = auth.uid()
));

CREATE POLICY "Members can update company contacts"
ON public.contacts FOR UPDATE
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
) OR company_id IN (
  SELECT id FROM public.companies WHERE owner_id = auth.uid()
));
