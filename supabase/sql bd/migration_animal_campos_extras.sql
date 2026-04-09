-- =============================================================================
-- Migração: campos extras em public.animal (bases já criadas com schemaBD.sql antigo)
-- Rode no SQL Editor do Supabase uma vez. Idempotente se usar IF NOT EXISTS.
-- =============================================================================

ALTER TABLE public.animal
  ADD COLUMN IF NOT EXISTS sexo text,
  ADD COLUMN IF NOT EXISTS porte text,
  ADD COLUMN IF NOT EXISTS data_nascimento date;

COMMENT ON COLUMN public.animal.sexo IS 'macho | femea (opcional)';
COMMENT ON COLUMN public.animal.porte IS 'pequeno | medio | grande (opcional)';
COMMENT ON COLUMN public.animal.data_nascimento IS 'Data de nascimento aproximada (opcional)';
