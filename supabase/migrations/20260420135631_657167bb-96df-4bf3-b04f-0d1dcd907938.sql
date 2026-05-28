-- 1. Add last_contact_at to contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS last_contact_at timestamp with time zone;

-- Backfill last_contact_at from existing conversations
UPDATE public.contacts c
SET last_contact_at = sub.last_msg
FROM (
  SELECT contact_id, MAX(last_message_at) AS last_msg
  FROM public.conversations
  WHERE last_message_at IS NOT NULL
  GROUP BY contact_id
) sub
WHERE c.id = sub.contact_id;

-- 2. Create customer_purchases table
CREATE TABLE IF NOT EXISTS public.customer_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  purchase_type text NOT NULL DEFAULT 'sale',
  notes text,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_purchases_company ON public.customer_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_purchases_contact ON public.customer_purchases(contact_id);

ALTER TABLE public.customer_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company purchases"
ON public.customer_purchases FOR SELECT TO authenticated
USING (is_company_member(company_id));

CREATE POLICY "Members can insert company purchases"
ON public.customer_purchases FOR INSERT TO authenticated
WITH CHECK (is_company_member(company_id));

CREATE POLICY "Members can update company purchases"
ON public.customer_purchases FOR UPDATE TO authenticated
USING (is_company_member(company_id));

CREATE POLICY "Admins can delete company purchases"
ON public.customer_purchases FOR DELETE TO authenticated
USING (is_company_admin(company_id));

CREATE TRIGGER trg_customer_purchases_updated_at
BEFORE UPDATE ON public.customer_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Function to update last_contact_at when a new inbound message arrives
CREATE OR REPLACE FUNCTION public.update_contact_last_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contacts
  SET last_contact_at = NEW.created_at
  WHERE id = (SELECT contact_id FROM public.conversations WHERE id = NEW.conversation_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_update_last_contact ON public.messages;
CREATE TRIGGER trg_messages_update_last_contact
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_contact_last_contact();

-- 4. Allow members to delete contacts (was missing)
CREATE POLICY "Admins can delete company contacts"
ON public.contacts FOR DELETE TO authenticated
USING (is_company_admin(company_id));