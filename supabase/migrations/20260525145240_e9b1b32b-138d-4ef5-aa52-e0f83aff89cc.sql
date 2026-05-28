-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum for instance status
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instance_status') THEN
        CREATE TYPE public.instance_status AS ENUM ('connected', 'disconnected', 'connecting');
    END IF;
END $$;

-- Create whatsapp_instances table
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    instance_name TEXT,
    status public.instance_status DEFAULT 'disconnected',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admins can manage all instances"
ON public.whatsapp_instances
FOR ALL
USING (auth.jwt() ->> 'email' = 'solidaatende@gmail.com');

CREATE POLICY "Users can view their own company instance"
ON public.whatsapp_instances
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_id = whatsapp_instances.company_id
        AND company_members.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = whatsapp_instances.company_id
        AND companies.owner_id = auth.uid()
    )
);

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_whatsapp_instances_updated_at ON public.whatsapp_instances;
CREATE TRIGGER update_whatsapp_instances_updated_at
BEFORE UPDATE ON public.whatsapp_instances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();