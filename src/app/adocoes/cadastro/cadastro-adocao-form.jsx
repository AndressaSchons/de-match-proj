"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarAdocao } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import { AdocaoTermoUpload } from "@/components/AdocaoTermoUpload";
import styles from "./cadastro-adocao-form.module.css";

const initialState = { ok: undefined, message: "" };

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function CadastroAdocaoForm({ animais, isAdmin = false, podeAnimal = true }) {
  const [state, formAction, pending] = useActionState(cadastrarAdocao, initialState);
  const formRef  = useRef(null);
  const router   = useRouter();

  // Remonta o AdocaoTermoUpload após sucesso (limpa o arquivo)
  const [formKey, setFormKey] = useState(0);
  // Bloqueia salvar enquanto o arquivo está subindo
  const [termoUploading, setTermoUploading] = useState(false);

  const onTermoUploadingChange = useCallback((v) => setTermoUploading(v), []);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      // Remontagem intencional após sucesso do server action (limpa upload do termo).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de formulário pós-submit
      setFormKey((k) => k + 1);
    }
  }, [state?.ok]);

  const podeCadastrar = Array.isArray(animais) && animais.length > 0;
  const canSave = podeCadastrar && !pending && !termoUploading;

  function getSaveLabel() {
    if (termoUploading) return "Aguardando arquivo…";
    if (pending)        return "Salvando…";
    return "Salvar";
  }

  return (
    <div className="pageLayout">
      <div className={`pageBody ${styles.bodyCenter}`} data-page-body>
        <div className={styles.center}>
          <form ref={formRef} action={formAction} className={styles.card}>

            {/* ── Toolbar ── */}
            <div className={styles.toolbar}>
              <button type="button" onClick={() => router.back()} className={styles.backBtn}>
                ← Voltar
              </button>
              <h1 className={styles.title}>Cadastrar adoção</h1>
            </div>

            {/* ── Animal ── */}
            <div className={styles.fieldStack}>
              <label className={styles.label} htmlFor="id_animal">Animal</label>
              <select
                id="id_animal"
                name="id_animal"
                required
                disabled={!podeCadastrar || pending}
                className={styles.select}
                defaultValue=""
              >
                <option value="" disabled>
                  {podeCadastrar ? "Selecione um animal…" : "Nenhum animal disponível"}
                </option>
                {animais?.map((a) => (
                  <option key={a.id_animal} value={a.id_animal}>
                    {a.nome_animal}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Data da adoção ── */}
            <div className={styles.fieldStack}>
              <label className={styles.label} htmlFor="data_adocao">Data da adoção</label>
              <input
                id="data_adocao"
                name="data_adocao"
                type="date"
                required
                disabled={pending}
                max={hoje()}
                defaultValue={hoje()}
                className={styles.select}
              />
            </div>

            {/* ── Termo ── */}
            <div className={styles.fieldStack}>
              <label className={styles.label} htmlFor="termo_anexo_url_fake">
                Termo de adoção (PDF ou imagem)
              </label>
              <div id="termo_anexo_url_fake" aria-label="Upload do termo de adoção">
                <AdocaoTermoUpload
                  key={formKey}
                  onUploadingChange={onTermoUploadingChange}
                />
              </div>
            </div>

            {/* ── Feedback ── */}
            {state?.message ? (
              <div className={state.ok ? styles.feedbackOk : styles.feedbackError} role="status">
                <span className={styles.feedbackIcon}>{state.ok ? "✓" : "✕"}</span>
                {state.message}
              </div>
            ) : null}

            {/* ── Actions ── */}
            <div className={styles.actions}>
              <button type="button" className={styles.btnCancel} onClick={() => router.back()}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className={styles.btnSave}
                title={termoUploading ? "Aguarde o envio do arquivo antes de salvar" : undefined}
              >
                {getSaveLabel()}
              </button>
            </div>

          </form>
        </div>

        <SidebarActions isAdmin={isAdmin} podeAnimal={podeAnimal} podeAdocao />
      </div>
    </div>
  );
}
