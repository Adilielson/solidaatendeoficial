
-- Add ai_enabled flag to conversations (per-conversation override)
ALTER TABLE public.conversations ADD COLUMN ai_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add ai_global_enabled flag to companies (global toggle)
ALTER TABLE public.companies ADD COLUMN ai_global_enabled BOOLEAN NOT NULL DEFAULT true;
