ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS uazapi_admin_token TEXT,
ADD COLUMN IF NOT EXISTS uazapi_server_url TEXT;

-- Garantir que a tabela whatsapp_instances tenha o que precisa
ALTER TABLE public.whatsapp_instances
ADD COLUMN IF NOT EXISTS instance_token TEXT,
ADD COLUMN IF NOT EXISTS server_url TEXT;