"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { createUserAccount } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./criar-conta-form.module.css";

const initialState = { ok: undefined, message: "" };

export function CriarContaForm() {
  const [state, formAction, pending] = useActionState(createUserAccount, initialState);
  const formRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>

        {/* ── Card central ── */}
        <div className={styles.center}>
          <form ref={formRef} action={formAction} className={styles.card}>

            <div className={styles.row}>
              <span className={styles.label}>Nome:</span>
              <input
                name="nome_completo"
                type="text"
                required
                autoComplete="name"
                className={styles.input}
              />
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Login:</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                className={styles.input}
              />
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Senha:</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldStack}>
              <span className={styles.label}>Tipo de usuário</span>
              <select name="perfil_acesso" required defaultValue="voluntario" className={styles.select}>
                {USER_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {USER_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            {state?.message && (
              <p className={state.ok ? styles.msgOk : styles.msgError} role="status">
                {state.message}
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className={styles.btnSave}
                style={{ opacity: pending ? 0.75 : 1 }}
              >
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </div>

          </form>
        </div>

        {/* ── Sidebar ── */}
        <SidebarActions />
      </div>
    </div>
  );
}