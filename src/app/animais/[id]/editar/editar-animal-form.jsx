"use client";

import { useActionState, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { atualizarAnimal } from "../../actions";
import { AnimalFormFields } from "../../animal-form";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "../../cadastro/cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

export function EditarAnimalForm({ idAnimal, defaultValues, isAdmin = false, podeAdocao, podeAnimal = true }) {
  const [state, formAction, pending] = useActionState(atualizarAnimal, initialState);
  const router = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  const onPhotoUploadingChange = useCallback((isUploading) => {
    setPhotoUploading(isUploading);
  }, []);

  function getSaveLabel() {
    if (photoUploading) return "Aguardando fotos…";
    if (pending)        return "Salvando…";
    return "Salvar alterações";
  }

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>
        <form action={formAction} className={styles.card}>

          {/* ── Toolbar ── */}
          <div className={styles.toolbar}>
            <Link href={`/animais/${idAnimal}`} className={styles.backBtn}>
              ← Voltar ao perfil
            </Link>
            <h1 className={styles.cardTitle}>Editar animal</h1>
          </div>

          <AnimalFormFields
            idAnimal={idAnimal}
            defaultValues={defaultValues}
            onPhotoUploadingChange={onPhotoUploadingChange}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => router.push(`/animais/${idAnimal}`)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || photoUploading}
              className={styles.btnSave}
              title={photoUploading ? "Aguarde o envio das fotos antes de salvar" : undefined}
            >
              {getSaveLabel()}
            </button>
          </div>

          {state?.message ? (
            <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
              {state.message}
            </p>
          ) : null}
        </form>

        <SidebarActions podeAnimal={podeAnimal} podeAdocao={podeAdocao} isAdmin={isAdmin} />
      </div>
    </div>
  );
}