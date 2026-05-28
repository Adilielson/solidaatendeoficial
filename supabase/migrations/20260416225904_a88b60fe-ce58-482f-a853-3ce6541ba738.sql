ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS triage_completed_at timestamptz;

CREATE INDEX IF NOT EXISTS conversations_triage_completed_at_idx
  ON public.conversations (company_id, triage_completed_at)
  WHERE triage_completed_at IS NOT NULL;