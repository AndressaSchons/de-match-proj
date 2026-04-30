"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import sharedStyles from "./AnimalPhotoUpload.module.css";

const BUCKET = "adocao-termos";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function extFromMime(mime) {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function isImageMime(mime) {
  return mime.startsWith("image/");
}

/**
 * Upload do termo para Supabase Storage + hidden `name="termo_anexo_url"` com URL pública.
 * @param {{ initialUrl?: string | null }} props
 */
export function AdocaoTermoUpload({ initialUrl = null }) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef(null);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [previewSrc, setPreviewSrc] = useState("");
  const [isPdf, setIsPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setUrl(initialUrl ?? "");
    setPreviewSrc("");
    setIsPdf(Boolean(initialUrl?.toLowerCase().includes(".pdf")));
  }, [initialUrl]);

  const uploadFile = useCallback(
    async (file) => {
      setError("");
      if (!ACCEPT_TYPES.includes(file.type)) {
        setError("Envie PDF ou imagem (JPG, PNG ou WebP).");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("Arquivo muito grande (máx. 10 MB).");
        return;
      }

      setUploading(true);
      try {
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr || !user) {
          setError("Entre na conta para enviar o termo.");
          return;
        }

        const ext = extFromMime(file.type);
        const path = `adocoes/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

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

        setUrl(publicUrl);
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

      const image = isImageMime(file.type);
      setIsPdf(file.type === "application/pdf");

      if (image) {
        setPreviewSrc((prev) => {
          if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
      } else {
        setPreviewSrc("");
      }

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
    <div className={sharedStyles.wrap}>
      <input type="hidden" name="termo_adocao_anexo_url" value={url} readOnly />

      <div
        className={`${sharedStyles.dropzone} ${dragOver ? sharedStyles.dragOver : ""}`}
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
        <p className={sharedStyles.hint}>
          Arraste um arquivo aqui ou escolha um arquivo (PDF ou imagem JPG/PNG/WebP, até 10 MB).
        </p>
        <button
          type="button"
          className={sharedStyles.btnFile}
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
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className={sharedStyles.hiddenInput}
          aria-hidden
          tabIndex={-1}
          onChange={onInputChange}
        />
      </div>

      {error ? (
        <p className={sharedStyles.error} role="alert">
          {error}
        </p>
      ) : null}

      {previewSrc ? (
        <div className={sharedStyles.preview}>
          <img src={previewSrc} alt="" className={sharedStyles.previewImg} />
          {url ? <span className={sharedStyles.urlFallback}>{url}</span> : null}
        </div>
      ) : url ? (
        <div className={sharedStyles.preview}>
          {isPdf ? <span className={sharedStyles.urlFallback}>PDF anexado: {url}</span> : null}
          {!isPdf ? <span className={sharedStyles.urlFallback}>{url}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

