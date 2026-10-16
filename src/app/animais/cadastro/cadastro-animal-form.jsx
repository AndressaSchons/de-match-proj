"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarAnimal } from "../actions";
import { AnimalFormFields } from "../animal-form";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

export function CadastroAnimalForm({ isAdmin = false, podeAdocao, podeAnimal = true, termoObrigatorio = false }) {
  const [state, formAction, pending] = useActionState(cadastrarAnimal, initialState);
  const formRef  = useRef(null);
  const router   = useRouter();

  const [photoUploading, setPhotoUploading] = useState(false);
  // Incrementar essa key força remontagem do AnimalFormFields → limpa foto
  const [formKey, setFormKey] = useState(0);

  const onPhotoUploadingChange = useCallback((isUploading) => {
    setPhotoUploading(isUploading);
  }, []);
  const [termoUploading, setTermoUploading] = useState(false);
  const onTermoUploadingChange = useCallback((v) => setTermoUploading(v), []);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      // Remontagem intencional após sucesso do server action (limpa upload de foto).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de formulário pós-submit
      setFormKey((k) => k + 1);
    }
  }, [state?.ok]);

  const canSave = !pending && !photoUploading && !termoUploading;

  function getSaveLabel() {
    if (photoUploading) return "Aguardando fotos…";
    if (termoUploading) return "Aguardando arquivo…";
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
            podeAdocao={podeAdocao}
            termoObrigatorio={termoObrigatorio}
            onTermoUploadingChange={onTermoUploadingChange}
          />

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={() => router.back()}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={styles.btnSave}
              title={photoUploading || termoUploading ? "Aguarde o envio dos arquivos antes de salvar" : undefined}
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

        <SidebarActions podeAnimal={podeAnimal} isAdmin={isAdmin} />
      </div>
    </div>
  );
}