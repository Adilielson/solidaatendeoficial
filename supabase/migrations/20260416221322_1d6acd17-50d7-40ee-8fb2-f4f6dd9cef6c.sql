-- 1. Add business_hours column to companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '{
  "mon": {"enabled": true, "start": "09:00", "end": "18:00"},
  "tue": {"enabled": true, "start": "09:00", "end": "18:00"},
  "wed": {"enabled": true, "start": "09:00", "end": "18:00"},
  "thu": {"enabled": true, "start": "09:00", "end": "18:00"},
  "fri": {"enabled": true, "start": "09:00", "end": "18:00"},
  "sat": {"enabled": false, "start": "09:00", "end": "13:00"},
  "sun": {"enabled": false, "start": "09:00", "end": "13:00"}
}'::jsonb;

-- 2. Allow owner to delete their company
CREATE POLICY "Owner can delete company"
ON public.companies
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 3. Create public bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies — files stored under {company_id}/...
CREATE POLICY "Public can view company logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Admins/owner can upload company logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT cm.company_id::text FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.role = 'admin'
    )
    OR (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM public.companies c WHERE c.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins/owner can update company logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT cm.company_id::text FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.role = 'admin'
    )
    OR (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM public.companies c WHERE c.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins/owner can delete company logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT cm.company_id::text FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.role = 'admin'
    )
    OR (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM public.companies c WHERE c.owner_id = auth.uid()
    )
  )
);