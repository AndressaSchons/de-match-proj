-- Rode UMA VEZ no SQL Editor (corrige o trigger que bloqueava UPDATE no painel).
-- Depois rode o UPDATE para virar administrador (e-mail ou uuid).

CREATE OR REPLACE FUNCTION public.fn_so_admin_muda_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'UPDATE' AND new.perfil_acesso IS DISTINCT FROM old.perfil_acesso THEN
    IF auth.uid() IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso = 'administrador'
    ) THEN
      RAISE EXCEPTION 'Apenas administrador pode alterar o perfil de acesso';
    END IF;
  END IF;
  RETURN new;
END;
$$;

-- Exemplo: promover pela conta de e-mail
-- UPDATE public.perfil p
-- SET perfil_acesso = 'administrador', data_atualizacao = now()
-- FROM auth.users u
-- WHERE u.id = p.id AND lower(u.email) = lower('seu@email.com');
