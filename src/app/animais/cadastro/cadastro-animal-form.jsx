"use client";

import { useActionState, useEffect, useRef } from "react";
import { cadastrarAnimal } from "../actions";
import { AnimalFormFields } from "../animal-form";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

/**
 * @param {{ isAdmin?: boolean, podeAnimal?: boolean }} props
 */
export function CadastroAnimalForm({ isAdmin = false, podeAnimal = true }) {
  const [state, formAction, pending] = useActionState(cadastrarAnimal, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <form ref={formRef} action={formAction} className={styles.card}>
          <AnimalFormFields />

          <div className={styles.actions}>
            <button
              type="submit"
              disabled={pending}
              className={styles.btnSave}
              style={{ opacity: pending ? 0.75 : 1 }}
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button type="reset" className={styles.btnCancel}>
              Cancelar
            </button>
          </div>

          {state?.message && (
            <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
              {state.message}
            </p>
          )}
        </form>

        <SidebarActions podeAnimal={podeAnimal} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
