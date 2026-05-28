ALTER TABLE public.companies
  DROP COLUMN IF EXISTS elevenlabs_agent_id,
  DROP COLUMN IF EXISTS elevenlabs_voice_id;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS voice_id text NOT NULL DEFAULT 'alloy',
  ADD COLUMN IF NOT EXISTS voice_enabled boolean NOT NULL DEFAULT true;