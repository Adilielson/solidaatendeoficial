CREATE OR REPLACE FUNCTION public.update_contact_last_contact()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Somente atualiza last_contact_at se a mensagem for de entrada (inbound)
  IF NEW.direction = 'inbound' THEN
    UPDATE public.contacts
    SET last_contact_at = NEW.created_at
    WHERE id = (SELECT contact_id FROM public.conversations WHERE id = NEW.conversation_id);
  END IF;
  RETURN NEW;
END;
$function$;