-- =============================================================================
-- Limpar o banco do projeto de-match (só o que a gente criou em public + 1 trigger no Auth)
-- =============================================================================
-- O que NÃO é apagado:
--   - Tabelas do próprio Supabase que você não criou (auth.users continua lá).
--
-- O que É apagado (só se existir — por isso usamos IF EXISTS):
--   - Tabelas: adoção, evento, animal, perfil do usuário, usuário antigo (legado).
--   - Funções e trigger que ligam o cadastro do Auth ao perfil.
--
-- Depois de rodar este arquivo, rode: recreate_de_match.sql
-- =============================================================================

-- Trigger no Auth (a tabela auth.users sempre existe no Supabase)
DROP TRIGGER IF EXISTS ao_cadastrar_usuario ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Apaga tabelas que dependem uma da outra (primeiro as que têm chave estrangeira)
DROP TABLE IF EXISTS public.adocao CASCADE;
DROP TABLE IF EXISTS public.evento CASCADE;
DROP TABLE IF EXISTS public.animal CASCADE;
DROP TABLE IF EXISTS public.perfil CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;

-- Nome antigo em inglês, caso ainda exista de uma versão anterior
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Funções usadas pelos triggers
DROP FUNCTION IF EXISTS public.fn_novo_usuario_cria_perfil() CASCADE;
DROP FUNCTION IF EXISTS public.fn_so_admin_muda_perfil() CASCADE;

-- Funções com nomes antigos (migrações antigas)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.profiles_guard_user_type_change() CASCADE;
