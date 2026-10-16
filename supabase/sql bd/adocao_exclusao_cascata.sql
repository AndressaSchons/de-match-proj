-- =============================================================================
-- Excluir um animal passa a excluir também a sua adoção (antes: RESTRICT bloqueava).
-- Rodar em bancos já criados. Pode ser rodado de novo com segurança.
-- =============================================================================

ALTER TABLE public.adocao DROP CONSTRAINT IF EXISTS adocao_id_animal_fkey;

ALTER TABLE public.adocao
  ADD CONSTRAINT adocao_id_animal_fkey
  FOREIGN KEY (id_animal) REFERENCES public.animal (id_animal) ON DELETE CASCADE;
