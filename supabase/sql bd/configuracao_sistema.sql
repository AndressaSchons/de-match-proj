-- =============================================================================
-- Configurações do sistema (linha única, id = 1). Rodar em bancos já criados.
--   metricas_somente_com_termo: métricas de adoção contam só adoções com termo anexado
--   termo_obrigatorio:          exige o termo ao cadastrar uma adoção
--   nome_ong:                   nome exibido na barra de navegação ("GAPA - [nome]")
-- Pode ser rodado de novo com segurança (ex.: para criar a coluna nome_ong).
-- Leitura: qualquer usuário autenticado. Alteração: somente administrador.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.configuracao_sistema (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  metricas_somente_com_termo boolean NOT NULL DEFAULT false,
  termo_obrigatorio boolean NOT NULL DEFAULT false,
  data_atualizacao timestamptz NOT NULL DEFAULT NOW(),
  id_usuario_atualizacao uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

INSERT INTO public.configuracao_sistema (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.configuracao_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS configuracao_ler_autenticado ON public.configuracao_sistema;
CREATE POLICY configuracao_ler_autenticado
  ON public.configuracao_sistema FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS configuracao_atualizar_admin ON public.configuracao_sistema;
CREATE POLICY configuracao_atualizar_admin
  ON public.configuracao_sistema FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfil p
      WHERE p.id = auth.uid() AND p.perfil_acesso = 'administrador'
    )
  );

-- Nome da ONG exibido na barra de navegação ("GAPA - [nome da ONG]").
ALTER TABLE public.configuracao_sistema ADD COLUMN IF NOT EXISTS nome_ong text NOT NULL DEFAULT '';
