
-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Company members: members can view their company's members
CREATE POLICY "Members can view company members"
ON public.company_members FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR company_id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
));

-- Companies: members can view their company
CREATE POLICY "Members can view own company"
ON public.companies FOR SELECT
TO authenticated
USING (id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
) OR owner_id = auth.uid());

-- Companies: owner can update
CREATE POLICY "Owner can update company"
ON public.companies FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Companies: authenticated users can create
CREATE POLICY "Authenticated users can create company"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Company members: admin can insert members
CREATE POLICY "Admin can add members"
ON public.company_members FOR INSERT
TO authenticated
WITH CHECK (company_id IN (
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role = 'admin'
) OR company_id IN (
  SELECT id FROM public.companies WHERE owner_id = auth.uid()
));
