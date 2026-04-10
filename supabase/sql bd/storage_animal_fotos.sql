-- =============================================================================
-- Storage: bucket público `animal-fotos` + políticas para upload (autenticados)

INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-fotos', 'animal-fotos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "animal_fotos_select_authenticated" ON storage.objects;
CREATE POLICY "animal_fotos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'animal-fotos');

DROP POLICY IF EXISTS "animal_fotos_insert_authenticated" ON storage.objects;
CREATE POLICY "animal_fotos_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'animal-fotos');

DROP POLICY IF EXISTS "animal_fotos_update_authenticated" ON storage.objects;
CREATE POLICY "animal_fotos_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'animal-fotos')
  WITH CHECK (bucket_id = 'animal-fotos');

DROP POLICY IF EXISTS "animal_fotos_delete_authenticated" ON storage.objects;
CREATE POLICY "animal_fotos_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'animal-fotos');
