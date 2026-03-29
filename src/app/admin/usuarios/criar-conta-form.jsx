"use client";

import { useActionState } from "react";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { createUserAccount } from "./actions";

const initialState = { ok: undefined, message: "" };

export function CriarContaForm() {
  const [state, formAction, pending] = useActionState(createUserAccount, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Nome da pessoa</span>
        <input name="nome_completo" type="text" required autoComplete="name" placeholder="Nome completo" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>E-mail (login)</span>
        <input name="email" type="email" required autoComplete="off" placeholder="email@exemplo.com" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Senha inicial</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Perfil de acesso</span>
        <select name="perfil_acesso" required defaultValue="voluntario">
          {USER_TYPES.map((value) => (
            <option key={value} value={value}>
              {USER_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={pending} style={{ marginTop: "0.25rem", padding: "0.6rem 1rem", cursor: "pointer" }}>
        {pending ? "Criando…" : "Criar conta"}
      </button>

      {state?.message ? (
        <p style={{ margin: 0, color: state.ok ? "#15803d" : "#b91c1c" }} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
