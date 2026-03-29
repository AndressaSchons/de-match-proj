"use client";

import { useActionState, useEffect, useRef } from "react";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { cadastrarAnimal } from "./actions";

const initialState = { ok: undefined, message: "" };

export function CadastroAnimalForm() {
  const [state, formAction, pending] = useActionState(cadastrarAnimal, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state?.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{ marginTop: "1rem", display: "grid", gap: "1rem", maxWidth: 520 }}
    >
      <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
        Campos marcados com <strong aria-hidden="true">*</strong> são obrigatórios (validação do fluxo de
        cadastro).
      </p>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>
          Nome do animal <strong aria-label="obrigatório">*</strong>
        </span>
        <input name="nome_animal" type="text" required minLength={1} autoComplete="off" placeholder="Ex.: Thor" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>
          Disponibilidade <strong aria-label="obrigatório">*</strong>
        </span>
        <select name="disponibilidade" required defaultValue="">
          <option value="" disabled>
            Selecione…
          </option>
          {DISPONIBILIDADE.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Raça</span>
        <input name="raca" type="text" placeholder="Opcional" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Localização</span>
        <input name="localizacao" type="text" placeholder="Onde está abrigado (opcional)" />
      </label>

      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input name="castrado" type="checkbox" value="on" />
        <span>Castrado</span>
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Vacinação</span>
        <input name="vacinacao" type="text" placeholder="Ex.: em dia, pendente (opcional)" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>História / descrição</span>
        <textarea name="descricao_historia" rows={3} placeholder="Opcional" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>URL da foto</span>
        <input name="foto" type="text" placeholder="Link da foto (opcional)" />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Observações</span>
        <textarea name="observacoes" rows={2} placeholder="Opcional" />
      </label>

      <button type="submit" disabled={pending} style={{ padding: "0.65rem 1rem", cursor: "pointer" }}>
        {pending ? "Salvando…" : "Cadastrar animal"}
      </button>

      {state?.message ? (
        <p style={{ margin: 0, color: state.ok ? "#15803d" : "#b91c1c" }} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
