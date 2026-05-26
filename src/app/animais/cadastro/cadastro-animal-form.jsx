"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>
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
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => router.back()}
            >
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
