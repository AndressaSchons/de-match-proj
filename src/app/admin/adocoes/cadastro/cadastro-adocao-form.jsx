"use client";

import { useActionState, useEffect, useRef } from "react";
import { cadastrarAdocao } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import { AdocaoTermoUpload } from "@/components/AdocaoTermoUpload";
import styles from "./cadastro-adocao-form.module.css";

const initialState = { ok: undefined, message: "" };

/**
 * @param {{ animais: Array<{ id_animal: number, nome_animal: string, disponibilidade?: string | null }> }} props
 */
export function CadastroAdocaoForm({ animais }) {
  const [state, formAction, pending] = useActionState(cadastrarAdocao, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  const podeCadastrar = Array.isArray(animais) && animais.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.center}>
          <form ref={formRef} action={formAction} className={styles.card}>
            <h1 className={styles.title}>Cadastrar adoção</h1>

            <div className={styles.fieldStack}>
              <label className={styles.label} htmlFor="id_animal">
                Animal
              </label>
              <select
                id="id_animal"
                name="id_animal"
                required
                disabled={!podeCadastrar || pending}
                className={styles.select}
                defaultValue=""
              >
                <option value="" disabled>
                  {podeCadastrar ? "Selecione um animal" : "Nenhum animal disponível"}
                </option>
                {animais?.map((a) => (
                  <option key={a.id_animal} value={a.id_animal}>
                    #{a.id_animal} — {a.nome_animal}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldStack}>
              <label className={styles.label} htmlFor="termo_anexo_url_fake">
                Termo de adoção (anexo)
              </label>
              <div id="termo_anexo_url_fake" aria-label="Upload do termo de adoção">
                <AdocaoTermoUpload />
              </div>
            </div>

            {state?.message && (
              <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
                {state.message}
              </p>
            )}

            <div className={styles.actions}>
              <button type="reset" className={styles.btnCancel} disabled={pending}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!podeCadastrar || pending}
                className={styles.btnSave}
                style={{ opacity: pending ? 0.75 : 1 }}
              >
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </div>

        <SidebarActions isAdmin podeAnimal />
      </div>
    </div>
  );
}

