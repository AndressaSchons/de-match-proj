"use client";

import { useActionState } from "react";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { updateContaPassword, updateContaProfile } from "./actions";

const initialState = { ok: undefined, message: "" };

export function ContaForm({ email, perfil }) {
  const [state, formAction, pending] = useActionState(updateContaProfile, initialState);
  const [pwdState, pwdAction, pwdPending] = useActionState(updateContaPassword, initialState);
  const isAdmin = perfil?.perfil_acesso === "administrador";
  const tipoAtual = perfil?.perfil_acesso ?? "voluntario";

  return (
    <>
      <form action={formAction} style={{ marginTop: "1rem", display: "grid", gap: "1rem", maxWidth: 420 }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>E-mail</span>
          <input type="text" value={email} readOnly style={{ opacity: 0.85 }} />
        </label>

        <label style={{ display: "grid", gap: "0.35rem" }}>
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

        <label style={{ display: "grid", gap: "0.35rem" }}>
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
                style={{ opacity: 0.85, cursor: "not-allowed" }}
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
          <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
            Apenas um <strong>administrador</strong> pode alterar o tipo de usuário. O nome você edita
            livremente.
          </p>
        ) : (
          <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
            Como administrador, você pode ajustar seu próprio tipo para testes. O primeiro admin da base
            é definido no SQL (veja o README).
          </p>
        )}

        <button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar conta"}
        </button>

        {state?.message ? (
          <p style={{ margin: 0, color: state.ok ? "#15803d" : "#b91c1c" }} role="status">
            {state.message}
          </p>
        ) : null}
      </form>

      <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.75rem" }}>Alterar senha</h2>
        <form action={pwdAction} style={{ display: "grid", gap: "1rem", maxWidth: 420 }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
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
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span>Confirmar nova senha</span>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={pwdPending}>
            {pwdPending ? "Atualizando…" : "Atualizar senha"}
          </button>
          {pwdState?.message ? (
            <p style={{ margin: 0, color: pwdState.ok ? "#15803d" : "#b91c1c" }} role="status">
              {pwdState.message}
            </p>
          ) : null}
        </form>
      </section>
    </>
  );
}
