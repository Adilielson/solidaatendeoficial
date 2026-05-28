-- Allow anonymous select on conversations
CREATE POLICY "Allow anonymous select on conversations" ON public.conversations
FOR SELECT USING (true);

-- Allow anonymous select on messages
CREATE POLICY "Allow anonymous select on messages" ON public.messages
FOR SELECT USING (true);

-- Allow anonymous select on followup_logs
CREATE POLICY "Allow anonymous select on followup_logs" ON public.followup_logs
FOR SELECT USING (true);

-- Allow anonymous select on whatsapp_instances
CREATE POLICY "Allow anonymous select on whatsapp_instances" ON public.whatsapp_instances
FOR SELECT USING (true);
