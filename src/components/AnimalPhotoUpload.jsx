"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./AnimalPhotoUpload.module.css";

const BUCKET = "animal-fotos";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png")  return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Expõe via ref:
 *   - isUploading: boolean  → pai bloqueia o submit enquanto true
 *   - reset()               → pai limpa foto após cadastro bem-sucedido
 */
export const AnimalPhotoUpload = forwardRef(function AnimalPhotoUpload({ initialUrl = null, onUploadingChange }, ref) {
  const supabase     = useMemo(() => createClient(), []);
  const fileInputRef = useRef(null);
  const [fotoUrl,    setFotoUrl]    = useState(initialUrl ?? "");
  const [previewSrc, setPreviewSrc] = useState(initialUrl ?? "");
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState("");
  const [dragOver,   setDragOver]   = useState(false);

  useEffect(() => {
    setFotoUrl(initialUrl ?? "");
    setPreviewSrc(initialUrl ?? "");
  }, [initialUrl]);

  // Expõe isUploading e reset() para o componente pai
  useImperativeHandle(ref, () => ({
    get isUploading() { return uploading; },
    reset() {
      setFotoUrl("");
      setPreviewSrc("");
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  }), [uploading]);

  const uploadFile = useCallback(async (file) => {
    setError("");
    if (!ACCEPT_TYPES.includes(file.type)) { setError("Use JPG, PNG ou WebP."); return; }
    if (file.size > MAX_BYTES)             { setError("Arquivo muito grande (máx. 5 MB)."); return; }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { setError("Entre na conta para enviar a foto."); return; }

      const ext  = extFromMime(file.type);
      const path = `animais/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) { setError(upErr.message); return; }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      setPreviewSrc((prev) => { if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev); return publicUrl; });
      setFotoUrl(publicUrl);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }, [supabase]);

  const onPickFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    setPreviewSrc((prev) => { if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    void uploadFile(file);
  }, [uploadFile]);

  const onInputChange = (e) => { if (e.target.files?.length) onPickFiles(e.target.files); e.target.value = ""; };
  const onDrop        = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onPickFiles([f]); };
  const onDragOver    = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragLeave   = (e) => { e.preventDefault(); setDragOver(false); };
  const triggerPick   = () => fileInputRef.current?.click();

  const dropHandlers = {
    onDrop, onDragOver, onDragLeave,
    role: "button", tabIndex: 0,
    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); triggerPick(); } },
    onClick: triggerPick,
  };

  const hasPhoto = Boolean(previewSrc);

  return (
    <div className={styles.wrap}>
      <input type="hidden" name="foto" value={fotoUrl} readOnly />

      {hasPhoto ? (
        <div className={`${styles.compact} ${dragOver ? styles.dragOver : ""} ${uploading ? styles.compactUploading : ""}`} {...dropHandlers}>
          <div className={styles.compactImgWrap}>
            <img src={previewSrc} alt="" className={styles.compactImg} />
            {uploading && <div className={styles.compactSpinner} />}
          </div>
          <div className={styles.compactInfo}>
            <span className={styles.compactLabel}>
              {uploading ? "Enviando foto…" : "Foto atual"}
            </span>
            <span className={styles.compactHint}>
              {uploading ? "Aguarde antes de salvar" : "Arraste ou clique para trocar"}
            </span>
          </div>
          {!uploading && (
            <button
              type="button"
              className={styles.compactBtn}
              onClick={(e) => { e.stopPropagation(); triggerPick(); }}
            >
              Trocar
            </button>
          )}
        </div>
      ) : (
        <div className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""}`} {...dropHandlers}>
          <p className={styles.hint}>Arraste uma imagem ou escolha um arquivo (JPG, PNG ou WebP, até 5 MB).</p>
          <button
            type="button"
            className={styles.btnFile}
            disabled={uploading}
            onClick={(e) => { e.stopPropagation(); triggerPick(); }}
          >
            {uploading ? "Enviando…" : "Escolher arquivo"}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.hiddenInput}
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </div>
  );
});