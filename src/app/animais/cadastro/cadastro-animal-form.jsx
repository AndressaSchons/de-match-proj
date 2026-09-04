"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarAnimal } from "../actions";
import { AnimalFormFields } from "../animal-form";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

export function CadastroAnimalForm({ isAdmin = false, podeAdocao, podeAnimal = true }) {
  const [state, formAction, pending] = useActionState(cadastrarAnimal, initialState);
  const formRef  = useRef(null);
  const router   = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  // Incrementar essa key força remontagem do AnimalFormFields → limpa foto
  const [formKey, setFormKey] = useState(0);

  const onPhotoUploadingChange = useCallback((isUploading) => {
    setPhotoUploading(isUploading);
  }, []);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      // Remontagem intencional após sucesso do server action (limpa upload de foto).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de formulário pós-submit
      setFormKey((k) => k + 1);
    }
  }, [state?.ok]);

  const canSave = !pending && !photoUploading;

  function getSaveLabel() {
    if (photoUploading) return "Aguardando fotos…";
    if (pending)        return "Salvando…";
    return "Salvar";
  }

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>
        <form ref={formRef} action={formAction} className={styles.card}>

          <div className={styles.toolbar}>
            <button type="button" onClick={() => router.back()} className={styles.backBtn}>
              ← Voltar
            </button>
            <h1 className={styles.cardTitle}>Cadastrar animal</h1>
          </div>

          <AnimalFormFields
            key={formKey}
            onPhotoUploadingChange={onPhotoUploadingChange}
          />

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={() => router.back()}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={styles.btnSave}
              title={photoUploading ? "Aguarde o envio das fotos antes de salvar" : undefined}
            >
              {getSaveLabel()}
            </button>
          </div>

          {state?.message ? (
            <div className={state.ok ? styles.feedbackOk : styles.feedbackError} role="status">
              <span className={styles.feedbackIcon}>{state.ok ? "✓" : "✕"}</span>
              {state.message}
            </div>
          ) : null}

        </form>

        <SidebarActions podeAnimal={podeAnimal} podeAdocao={podeAdocao} isAdmin={isAdmin} />
      </div>
    </div>
  );
}