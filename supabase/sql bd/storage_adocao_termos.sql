-- =============================================================================
-- Storage: bucket público `adocao-termos` + políticas para upload (autenticados)
--
-- Necessário porque o upload é feito pelo navegador usando a chave anon,
-- então a tabela `storage.objects` aplica RLS.

INSERT INTO storage.buckets (id, name, public)
VALUES ('adocao-termos', 'adocao-termos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "adocao_termos_select_authenticated" ON storage.objects;
CREATE POLICY "adocao_termos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'adocao-termos');

DROP POLICY IF EXISTS "adocao_termos_insert_authenticated" ON storage.objects;
CREATE POLICY "adocao_termos_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'adocao-termos');

DROP POLICY IF EXISTS "adocao_termos_update_authenticated" ON storage.objects;
CREATE POLICY "adocao_termos_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'adocao-termos')
  WITH CHECK (bucket_id = 'adocao-termos');

DROP POLICY IF EXISTS "adocao_termos_delete_authenticated" ON storage.objects;
CREATE POLICY "adocao_termos_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'adocao-termos');

