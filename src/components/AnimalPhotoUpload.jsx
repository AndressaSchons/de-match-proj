"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MAX_FOTOS } from "@/lib/animal-form-parse";
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
 * Galeria de fotos do animal. A primeira da lista é a capa (vira `animal.foto`).
 *
 * Expõe via ref:
 *   - isUploading: boolean  → pai bloqueia o submit enquanto true
 *   - reset()               → pai limpa a galeria após cadastro bem-sucedido
 */
export const AnimalPhotoUpload = forwardRef(function AnimalPhotoUpload({ initialUrls = [], onUploadingChange }, ref) {
  const supabase     = useMemo(() => createClient(), []);
  const fileInputRef = useRef(null);
  const [fotos,     setFotos]     = useState(() => initialUrls.filter(Boolean));
  const [pendentes, setPendentes] = useState([]); // uploads em andamento: { id, previewSrc }
  const [error,     setError]     = useState("");
  const [dragOver,  setDragOver]  = useState(false);

  // `initialUrls` costuma ser um array novo a cada render; a chave serializada evita o loop.
  const initialKey = JSON.stringify(initialUrls);
  useEffect(() => {
    setFotos(JSON.parse(initialKey).filter(Boolean));
  }, [initialKey]);

  const uploading = pendentes.length > 0;
  const restantes = MAX_FOTOS - fotos.length - pendentes.length;

  // Avisa o pai sempre que o estado de envio muda, para ele travar o botão Salvar.
  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  useImperativeHandle(ref, () => ({
    get isUploading() { return uploading; },
    reset() {
      setFotos([]);
      setPendentes((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewSrc));
        return [];
      });
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  }), [uploading]);

  const uploadFile = useCallback(async (file, pendenteId) => {
    const encerrarPendente = () => {
      setPendentes((prev) => {
        const alvo = prev.find((p) => p.id === pendenteId);
        if (alvo) URL.revokeObjectURL(alvo.previewSrc);
        return prev.filter((p) => p.id !== pendenteId);
      });
    };

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
      setFotos((prev) => (prev.includes(pub.publicUrl) ? prev : [...prev, pub.publicUrl]));
    } finally {
      encerrarPendente();
    }
  }, [supabase]);

  const onPickFiles = useCallback((fileList) => {
    const arquivos = Array.from(fileList ?? []);
    if (arquivos.length === 0) return;

    setError("");
    const aceitos = [];
    let recusouTipo = false;
    let recusouTamanho = false;
    let estourouLimite = false;

    for (const file of arquivos) {
      if (!ACCEPT_TYPES.includes(file.type)) { recusouTipo = true; continue; }
      if (file.size > MAX_BYTES)             { recusouTamanho = true; continue; }
      if (aceitos.length >= restantes)       { estourouLimite = true; break; }
      aceitos.push(file);
    }

    if (recusouTipo)     setError("Use JPG, PNG ou WebP.");
    else if (recusouTamanho) setError("Arquivo muito grande (máx. 5 MB).");
    else if (estourouLimite) setError(`Máximo de ${MAX_FOTOS} fotos por animal.`);

    for (const file of aceitos) {
      const id = crypto.randomUUID();
      setPendentes((prev) => [...prev, { id, previewSrc: URL.createObjectURL(file) }]);
      void uploadFile(file, id);
    }
  }, [restantes, uploadFile]);

  const removerFoto = useCallback((url) => {
    setFotos((prev) => prev.filter((f) => f !== url));
    setError("");
  }, []);

  const definirCapa = useCallback((url) => {
    setFotos((prev) => [url, ...prev.filter((f) => f !== url)]);
  }, []);

  const podeAdicionar = restantes > 0;
  const triggerPick   = () => { if (podeAdicionar) fileInputRef.current?.click(); };

  const onInputChange = (e) => { onPickFiles(e.target.files); e.target.value = ""; };

  const dropHandlers = {
    onDrop:      (e) => { e.preventDefault(); setDragOver(false); onPickFiles(e.dataTransfer.files); },
    onDragOver:  (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); },
    onDragLeave: (e) => { e.preventDefault(); setDragOver(false); },
    onClick:     triggerPick,
    onKeyDown:   (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); triggerPick(); } },
    role: "button",
    tabIndex: 0,
  };

  const vazio = fotos.length === 0 && pendentes.length === 0;

  return (
    <div className={styles.wrap}>
      {fotos.map((url) => (
        <input key={url} type="hidden" name="fotos" value={url} readOnly />
      ))}

      {vazio ? (
        <div className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""}`} {...dropHandlers}>
          <p className={styles.hint}>
            Arraste imagens aqui (JPG, PNG ou WebP, até 5 MB; máx. {MAX_FOTOS} fotos).
          </p>
          <button
            type="button"
            className={styles.btnFile}
            onClick={(e) => { e.stopPropagation(); triggerPick(); }}
          >
            Escolher arquivos
          </button>
        </div>
      ) : (
        <>
          <ul className={styles.grid}>
            {fotos.map((url, i) => (
              <li key={url} className={styles.tile}>
                <img src={url} alt="" className={styles.tileImg} />
                {i === 0 ? <span className={styles.capaBadge}>Capa</span> : null}
                <div className={styles.tileActions}>
                  {i === 0 ? null : (
                    <button
                      type="button"
                      className={styles.tileBtn}
                      title="Usar como capa"
                      onClick={() => definirCapa(url)}
                    >
                      Capa
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                    title="Remover foto"
                    aria-label="Remover foto"
                    onClick={() => removerFoto(url)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}

            {pendentes.map((p) => (
              <li key={p.id} className={`${styles.tile} ${styles.tilePendente}`}>
                <img src={p.previewSrc} alt="" className={styles.tileImg} />
                <div className={styles.tileSpinner} />
              </li>
            ))}

            {podeAdicionar ? (
              <li
                className={`${styles.tile} ${styles.tileAdd} ${dragOver ? styles.dragOver : ""}`}
                aria-label="Adicionar fotos"
                {...dropHandlers}
              >
                <span className={styles.tileAddIcon}>+</span>
                <span className={styles.tileAddLabel}>Adicionar</span>
              </li>
            ) : null}
          </ul>

          <p className={styles.gridHint}>
            {uploading
              ? "Enviando fotos… aguarde antes de salvar."
              : `A primeira foto é a capa. ${fotos.length} de ${MAX_FOTOS} usadas.`}
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
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
