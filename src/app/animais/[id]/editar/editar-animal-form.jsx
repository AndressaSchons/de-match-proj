"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { atualizarAnimal } from "../../actions";
import { AnimalFormFields } from "../../animal-form";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "../../cadastro/cadastro-animal-form.module.css";

const initialState = { ok: undefined, message: "" };

/**
 * @param {{ idAnimal: number, defaultValues: object, isAdmin?: boolean, podeAnimal?: boolean }} props
 */
export function EditarAnimalForm({ idAnimal, defaultValues, isAdmin = false, podeAnimal = true }) {
  const [state, formAction, pending] = useActionState(atualizarAnimal, initialState);
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <form action={formAction} className={styles.card}>
          <div className={styles.row} style={{ marginBottom: "0.5rem" }}>
            <Link href={`/animais/${idAnimal}`} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-green-dark)" }}>
              Voltar ao perfil
            </Link>
          </div>

          <AnimalFormFields idAnimal={idAnimal} defaultValues={defaultValues} />

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={() => router.push(`/animais/${idAnimal}`)}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className={styles.btnSave}
              style={{ opacity: pending ? 0.75 : 1 }}
            >
              {pending ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>

          {state?.message ? (
            <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
              {state.message}
            </p>
          ) : null}
        </form>

        <SidebarActions podeAnimal={podeAnimal} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
