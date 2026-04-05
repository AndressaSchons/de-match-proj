"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { atualizarUsuario } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./perfil-usuario.module.css";

const initialState = { ok: undefined, message: "" };

/* ─── Modo visualização ─────────────────────────────────── */
function ModoView({ id, nome, email, perfilAcesso }) {
  const router = useRouter();

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.label}>Nome:</span>
        <span className={styles.value}>{nome ?? "—"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Login:</span>
        <span className={styles.value}>{email ?? "—"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Tipo de perfil:</span>
        <span className={styles.badge}>
          {USER_TYPE_LABELS[perfilAcesso] ?? perfilAcesso}
        </span>
      </div>

      <div className={styles.actions}>
        <Link
          href={`/admin/usuarios/${id}?modo=editar`}
          className={styles.btnEdit}
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.btnBack}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

/* ─── Modo edição ───────────────────────────────────────── */
function ModoEdit({ id, nome, email, perfilAcesso }) {
  const [state, formAction, pending] = useActionState(atualizarUsuario, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className={styles.card}>
      <input type="hidden" name="id" value={id} />

      <div className={styles.row}>
        <span className={styles.label}>Nome:</span>
        <input
          name="nome_completo"
          type="text"
          required
          defaultValue={nome}
          autoComplete="name"
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Login:</span>
        <input
          type="email"
          value={email ?? "—"}
          readOnly
          disabled
          className={`${styles.input} ${styles.inputDisabled}`}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Tipo de perfil:</span>
        <select
          name="perfil_acesso"
          required
          defaultValue={perfilAcesso}
          className={styles.select}
        >
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
          className={styles.btnEdit}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className={styles.btnBack}
          style={{ opacity: pending ? 0.75 : 1 }}
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function PerfilUsuario({ id, nome, email, perfilAcesso, editar }) {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.center}>
          {editar ? (
            <ModoEdit id={id} nome={nome} email={email} perfilAcesso={perfilAcesso} />
          ) : (
            <ModoView id={id} nome={nome} email={email} perfilAcesso={perfilAcesso} />
          )}
        </div>
        <SidebarActions />
      </div>
    </div>
  );
}
