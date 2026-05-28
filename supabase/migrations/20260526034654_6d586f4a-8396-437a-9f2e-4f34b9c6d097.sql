-- Create AI settings table
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Atendente Virtual',
    tone TEXT DEFAULT 'amigável',
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_settings
CREATE POLICY "Membros da empresa podem ver configurações da IA" 
ON public.ai_settings FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem atualizar configurações da IA" 
ON public.ai_settings FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins podem inserir configurações da IA" 
ON public.ai_settings FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Ensure products table has RLS for reading if it doesn't already
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Empresas podem ver seus próprios produtos'
    ) THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Empresas podem ver seus próprios produtos" 
        ON public.products FOR SELECT 
        USING (
            company_id IN (
                SELECT id FROM public.companies WHERE owner_id = auth.uid()
                UNION
                SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists to avoid errors on retry
DROP TRIGGER IF EXISTS update_ai_settings_updated_at ON public.ai_settings;

CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON public.ai_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
