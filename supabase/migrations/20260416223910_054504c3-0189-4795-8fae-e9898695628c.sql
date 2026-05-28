-- 1. Company-level followup settings
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS followup_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS followup_intervals_hours integer[] NOT NULL DEFAULT ARRAY[24, 72]::integer[],
  ADD COLUMN IF NOT EXISTS followup_template_first text NOT NULL DEFAULT 'Oi {{nome}}! 👋 Vi que nossa conversa parou. Posso continuar de onde paramos para te ajudar?',
  ADD COLUMN IF NOT EXISTS followup_template_second text NOT NULL DEFAULT 'Olá {{nome}}, este é nosso último contato. Se ainda tiver interesse, é só me responder por aqui que retomo o atendimento.';

-- 2. Followup status enum + conversation columns
DO $$ BEGIN
  CREATE TYPE public.followup_status AS ENUM ('active', 'exhausted', 'failed', 'disabled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS followup_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_status public.followup_status NOT NULL DEFAULT 'active';

-- 3. followup_logs table
DO $$ BEGIN
  CREATE TYPE public.followup_send_status AS ENUM ('sent', 'failed', 'blocked', 'invalid_number');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.followup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  attempt_number integer NOT NULL,
  template_used text NOT NULL,
  message text NOT NULL,
  status public.followup_send_status NOT NULL,
  error text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followup_logs_company ON public.followup_logs(company_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_followup_logs_conversation ON public.followup_logs(conversation_id);

ALTER TABLE public.followup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view followup logs"
ON public.followup_logs FOR SELECT TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid())
  OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
);