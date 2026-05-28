-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_products_active ON public.products(company_id, is_active);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company products"
  ON public.products FOR SELECT TO authenticated
  USING (is_company_member(company_id));

CREATE POLICY "Members can insert company products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (is_company_member(company_id));

CREATE POLICY "Members can update company products"
  ON public.products FOR UPDATE TO authenticated
  USING (is_company_member(company_id));

CREATE POLICY "Admins can delete company products"
  ON public.products FOR DELETE TO authenticated
  USING (is_company_admin(company_id));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Product images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');