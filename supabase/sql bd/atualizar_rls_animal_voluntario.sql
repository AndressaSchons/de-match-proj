-- Voluntário pode cadastrar e editar animal (diagrama de casos de uso).
-- Rode no SQL Editor se o banco foi criado com a regra antiga (só admin/validador).

DROP POLICY IF EXISTS animal_inserir_equipe ON public.animal;
CREATE POLICY animal_inserir_equipe
  ON public.animal FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso IN ('administrador', 'validador', 'voluntario')
    )
  );

DROP POLICY IF EXISTS animal_atualizar_equipe ON public.animal;
CREATE POLICY animal_atualizar_equipe
  ON public.animal FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso IN ('administrador', 'validador', 'voluntario')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso IN ('administrador', 'validador', 'voluntario')
    )
  );
