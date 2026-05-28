-- Add columns needed by uazapi integration
ALTER TABLE public.whatsapp_instances
  ADD COLUMN IF NOT EXISTS server_url text,
  ADD COLUMN IF NOT EXISTS instance_token text,
  ADD COLUMN IF NOT EXISTS token_label text,
  ADD COLUMN IF NOT EXISTS webhook_url text,
  ADD COLUMN IF NOT EXISTS is_connected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_connection_at timestamptz;

-- Enable RLS (already on but ensure)
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Policies: members of company can view non-sensitive fields via app; sensitive cols read only via service role.
DROP POLICY IF EXISTS "Members can view company whatsapp instances" ON public.whatsapp_instances;
CREATE POLICY "Members can view company whatsapp instances"
ON public.whatsapp_instances
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);

-- No INSERT/UPDATE/DELETE policies for clients: edge function uses service role.

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS whatsapp_instances_updated_at ON public.whatsapp_instances;
CREATE TRIGGER whatsapp_instances_updated_at
BEFORE UPDATE ON public.whatsapp_instances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();