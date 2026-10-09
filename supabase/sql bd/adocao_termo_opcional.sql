-- =============================================================================
-- Adoção sem termo: `adocao.termo_adocao` passa a aceitar NULL
-- (NULL = "Aguardando termo de adoção"). Rodar em bancos já criados.
-- =============================================================================

ALTER TABLE public.adocao ALTER COLUMN termo_adocao DROP NOT NULL;
