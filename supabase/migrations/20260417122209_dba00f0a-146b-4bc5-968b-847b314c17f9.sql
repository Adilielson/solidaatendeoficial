ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS elevenlabs_agent_id text,
  ADD COLUMN IF NOT EXISTS elevenlabs_voice_id text;