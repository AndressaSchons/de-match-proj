"use client";

import { useActionState, useCallback, useState } from "react";
import { anexarTermoAdocao } from "@/app/adocoes/cadastro/actions";
import { AdocaoTermoUpload } from "@/components/AdocaoTermoUpload";
import styles from "./animal-detail-view.module.css";

const initialState = { ok: undefined, message: "" };

/** Envio do termo para uma adoção cadastrada sem ele ("Aguardando termo de adoção"). */
export function AnexarTermoForm({ idAnimal }) {
  const [state, formAction, pending] = useActionState(anexarTermoAdocao, initialState);
  // Bloqueia salvar enquanto o arquivo está subindo
  const [termoUploading, setTermoUploading] = useState(false);
  const onTermoUploadingChange = useCallback((v) => setTermoUploading(v), []);

  function getSaveLabel() {
    if (termoUploading) return "Aguardando arquivo…";
    if (pending)        return "Salvando…";
    return "Salvar termo";
  }

  return (
    <section className={styles.block}>
      <h2 className={styles.blockTitle}>Anexar termo de adoção</h2>
      <form action={formAction} className={styles.termForm}>
        <input type="hidden" name="id_animal" value={String(idAnimal)} />
        <AdocaoTermoUpload onUploadingChange={onTermoUploadingChange} />

        {state?.message ? (
          <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
            {state.message}
          </p>
        ) : null}

        <div className={styles.termFormActions}>
          <button type="submit" disabled={pending || termoUploading} className={styles.btnPrimary}>
            {getSaveLabel()}
          </button>
        </div>
      </form>
    </section>
  );
}
