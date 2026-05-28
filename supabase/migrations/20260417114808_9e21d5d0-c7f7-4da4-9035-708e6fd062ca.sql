-- Função que cria fluxo de triagem padrão para uma empresa
CREATE OR REPLACE FUNCTION public.create_default_triage_flow(_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_flow_id uuid;
BEGIN
  -- Não criar se já existir algum fluxo
  IF EXISTS (SELECT 1 FROM public.triage_flows WHERE company_id = _company_id) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.triage_flows (company_id, name, is_active)
  VALUES (_company_id, 'Triagem Padrão', true)
  RETURNING id INTO v_flow_id;

  INSERT INTO public.triage_steps (flow_id, order_position, question, field_type, is_required, conclusion_action)
  VALUES
    (v_flow_id, 1, 'Para começarmos, qual é o seu nome?', 'text', true, NULL),
    (v_flow_id, 2, 'Sobre o que você gostaria de falar com a gente hoje?', 'text', true, NULL),
    (v_flow_id, 3, 'Qual o melhor horário e canal para um especialista te chamar?', 'text', true, 'transfer');

  RETURN v_flow_id;
END;
$$;

-- Trigger: ao criar empresa, gera fluxo padrão
CREATE OR REPLACE FUNCTION public.on_company_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.create_default_triage_flow(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_default_flow ON public.companies;
CREATE TRIGGER trg_company_default_flow
AFTER INSERT ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.on_company_created();

-- Backfill: empresas sem fluxo recebem o padrão
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN SELECT id FROM public.companies WHERE id NOT IN (SELECT DISTINCT company_id FROM public.triage_flows)
  LOOP
    PERFORM public.create_default_triage_flow(c.id);
  END LOOP;
END $$;