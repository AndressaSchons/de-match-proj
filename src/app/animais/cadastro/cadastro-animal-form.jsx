"use client";

import { useActionState, useEffect, useRef } from "react";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { cadastrarAnimal } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

/* ═══════════════════════════════════════════════════════ */
export function CadastroAnimalForm() {
  const [state, formAction, pending] = useActionState(cadastrarAnimal, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>

        {/* ── Form card ── */}
        <form ref={formRef} action={formAction} className={styles.card}>

          {/* Nome + Foto */}
          <div className={styles.row}>
            <span className={styles.label}>Nome:</span>
            <input name="nome_animal" type="text" required autoComplete="off" className={styles.inputShort} />
            <div className={styles.spacer} />
            <button type="button" className={styles.btnPhoto}>Carregar foto…</button>
          </div>

          {/* Sexo + Porte */}
          <div className={styles.row}>
            <span className={styles.label}>Sexo:</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="sexo" value="femea" /> Fêmea
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="sexo" value="macho" /> Macho
              </label>
            </div>
            <span className={`${styles.label} ${styles.labelRight}`}>Porte:</span>
            <select name="porte" defaultValue="">
              <option value="" disabled />
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>

          {/* Castração + Situação */}
          <div className={styles.row}>
            <span className={styles.label}>Castração:</span>
            <select name="castrado" defaultValue="">
              <option value="" disabled />
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
            <span className={`${styles.label} ${styles.labelRight}`}>Situação:</span>
            <select name="disponibilidade" required defaultValue="">
              <option value="" disabled />
              {DISPONIBILIDADE.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>

          {/* Data nascimento + Cor/Raça */}
          <div className={styles.row}>
            <span className={styles.label}>Data de Nascimento:</span>
            <input name="data_nascimento" type="date" className={styles.inputShort} />
            <span className={`${styles.label} ${styles.labelRight}`}>Cor/Raça:</span>
            <input name="raca" type="text" className={styles.inputMid} />
          </div>

          {/* História */}
          <div>
            <p className={styles.sectionLabel}>História:</p>
            <textarea name="descricao_historia" rows={4} />
          </div>

          {/* Observações */}
          <div>
            <p className={styles.sectionLabel}>Observações</p>
            <textarea name="observacoes" rows={2} />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="submit"
              disabled={pending}
              className={styles.btnSave}
              style={{ opacity: pending ? 0.75 : 1 }}
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button type="reset" className={styles.btnCancel}>Cancelar</button>
          </div>

          {state?.message && (
            <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
              {state.message}
            </p>
          )}
        </form>

        {/* ── Sidebar ── */}
        <SidebarActions active="/animais/cadastro" />
      </div>
    </div>
  );
}