"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./AnimalPhotoUpload.module.css";

const BUCKET = "animal-fotos";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Upload para Supabase Storage + hidden `name="foto"` com URL pública.
 * @param {{ initialUrl?: string | null }} props
 */
export function AnimalPhotoUpload({ initialUrl = null }) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef(null);
  const [fotoUrl, setFotoUrl] = useState(initialUrl ?? "");
  const [previewSrc, setPreviewSrc] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setFotoUrl(initialUrl ?? "");
    setPreviewSrc(initialUrl ?? "");
  }, [initialUrl]);

  const uploadFile = useCallback(
    async (file) => {
      setError("");
      if (!ACCEPT_TYPES.includes(file.type)) {
        setError("Use JPG, PNG ou WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("Arquivo muito grande (máx. 5 MB).");
        return;
      }

      setUploading(true);
      try {
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr || !user) {
          setError("Entre na conta para enviar a foto.");
          return;
        }

        const ext = extFromMime(file.type);
        const path = `animais/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

        if (upErr) {
          setError(upErr.message);
          return;
        }

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const publicUrl = pub.publicUrl;

        setPreviewSrc((prev) => {
          if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
          return publicUrl;
        });
        setFotoUrl(publicUrl);
      } finally {
        setUploading(false);
      }
    },
    [supabase]
  );

  const onPickFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;

      setPreviewSrc((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });

      void uploadFile(file);
    },
    [uploadFile]
  );

  const onInputChange = (e) => {
    const list = e.target.files;
    if (list?.length) onPickFiles(list);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPickFiles([file]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={styles.wrap}>
      <input type="hidden" name="foto" value={fotoUrl} readOnly />

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className={styles.hint}>
          Arraste uma imagem aqui ou escolha um arquivo (JPG, PNG ou WebP, até 5 MB).
        </p>
        <button
          type="button"
          className={styles.btnFile}
          disabled={uploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {uploading ? "Enviando…" : "Escolher arquivo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.hiddenInput}
          aria-hidden
          tabIndex={-1}
          onChange={onInputChange}
        />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {previewSrc ? (
        <div className={styles.preview}>
          <img src={previewSrc} alt="" className={styles.previewImg} />
          {fotoUrl ? <span className={styles.urlFallback}>{fotoUrl}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
