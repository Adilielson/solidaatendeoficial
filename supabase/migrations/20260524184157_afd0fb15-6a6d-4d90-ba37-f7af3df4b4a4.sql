-- Allow anonymous select on companies
CREATE POLICY "Allow anonymous select on companies" ON public.companies
FOR SELECT USING (true);

-- Allow anonymous select on contacts
CREATE POLICY "Allow anonymous select on contacts" ON public.contacts
FOR SELECT USING (true);

-- Allow anonymous select on company_members
CREATE POLICY "Allow anonymous select on company_members" ON public.company_members
FOR SELECT USING (true);

-- Allow anonymous select on customer_purchases
CREATE POLICY "Allow anonymous select on customer_purchases" ON public.customer_purchases
FOR SELECT USING (true);
