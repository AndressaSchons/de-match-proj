"use client";

import { useActionState } from "react";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { updateContaPassword, updateContaProfile } from "./actions";
import styles from "./conta.module.css";

const initialState = { ok: undefined, message: "" };

export function ContaForm({ email, perfil }) {
  const [state, formAction, pending] = useActionState(updateContaProfile, initialState);
  const [pwdState, pwdAction, pwdPending] = useActionState(updateContaPassword, initialState);
  const isAdmin = perfil?.perfil_acesso === "administrador";
  const tipoAtual = perfil?.perfil_acesso ?? "voluntario";

  return (
    <>
      <form action={formAction} className={styles.form}>
        <label className={styles.field}>
          <span>E-mail</span>
          <input type="text" value={email} readOnly className={styles.inputReadonly} />
        </label>

        <label className={styles.field}>
          <span>Nome</span>
          <input
            name="nome_completo"
            type="text"
            required
            defaultValue={perfil?.nome_completo ?? ""}
            placeholder="Seu nome completo"
            autoComplete="name"
          />
        </label>

        <label className={styles.field}>
          <span>Tipo de usuário</span>
          {isAdmin ? (
            <select name="perfil_acesso" defaultValue={tipoAtual} required>
              {USER_TYPES.map((value) => (
                <option key={value} value={value}>
                  {USER_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input type="hidden" name="perfil_acesso" value={tipoAtual} />
              <select
                defaultValue={tipoAtual}
                disabled
                aria-disabled="true"
                className={styles.selectDisabled}
              >
                {USER_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {USER_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </>
          )}
        </label>

        {!isAdmin ? (
          <p className={styles.hint}>
            Apenas um <strong>administrador</strong> pode alterar o tipo de usuário. O nome você edita
            livremente.
          </p>
        ) : (
          <p className={styles.hint}>
          </p>
        )}

        <button type="submit" disabled={pending} className={styles.submitBtn}>
          {pending ? "Salvando…" : "Salvar conta"}
        </button>

        {state?.message ? (
          <p className={state.ok ? styles.feedbackOk : styles.feedbackErr} role="status">
            {state.message}
          </p>
        ) : null}
      </form>

      <section className={styles.passwordSection}>
        <h2 className={styles.passwordTitle}>Alterar senha</h2>
        <form action={pwdAction} className={styles.form}>
          <label className={styles.field}>
            <span>Nova senha</span>
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <label className={styles.field}>
            <span>Confirmar nova senha</span>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={pwdPending} className={styles.submitBtn}>
            {pwdPending ? "Atualizando…" : "Atualizar senha"}
          </button>
          {pwdState?.message ? (
            <p className={pwdState.ok ? styles.feedbackOk : styles.feedbackErr} role="status">
              {pwdState.message}
            </p>
          ) : null}
        </form>
      </section>
    </>
  );
}
