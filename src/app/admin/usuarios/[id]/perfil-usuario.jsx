"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/user-types";
import { atualizarUsuario } from "./actions";
import { deletarUsuario, redefinirSenha } from "../gerenciar/actions";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./perfil-usuario.module.css";

const initialState = { ok: undefined, message: "" };

function AdminTools({ id, isSelf }) {
  const [pwdState, pwdAction, pwdPending] = useActionState(redefinirSenha, initialState);
  const [delState, delAction, delPending] = useActionState(deletarUsuario, initialState);

  function confirmDelete(e) {
    if (
      !confirm(
        "Excluir este usuário permanentemente? Esta ação não pode ser desfeita."
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className={styles.adminCard}>
      <h3 className={styles.adminTitle}>Ferramentas de administrador</h3>

      <form action={pwdAction} className={styles.subForm}>
        <input type="hidden" name="id" value={id} />
        <p className={styles.subLabel}>Definir nova senha de acesso</p>
        <label className={styles.subField}>
          <span>Nova senha</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className={styles.input}
          />
        </label>
        <button type="submit" disabled={pwdPending} className={styles.btnSenha}>
          {pwdPending ? "Salvando…" : "Redefinir senha"}
        </button>
        {pwdState?.message ? (
          <p className={pwdState.ok ? styles.msgOk : styles.msgError} role="status">
            {pwdState.message}
          </p>
        ) : null}
      </form>

      {!isSelf ? (
        <form action={delAction} className={styles.deleteBlock} onSubmit={confirmDelete}>
          <input type="hidden" name="id" value={id} />
          <p className={styles.deleteHint}>Remove a conta do Auth e o perfil no banco.</p>
          <button type="submit" disabled={delPending} className={styles.btnDanger}>
            {delPending ? "Excluindo…" : "Excluir usuário"}
          </button>
          {delState?.message ? (
            <p className={delState.ok ? styles.msgOk : styles.msgError} role="status">
              {delState.message}
            </p>
          ) : null}
        </form>
      ) : (
        <p className={styles.selfHint}>Para excluir a própria conta, use outro administrador ou o painel do Supabase.</p>
      )}
    </div>
  );
}

/* ─── Modo visualização ─────────────────────────────────── */
function ModoView({ id, nome, email, perfilAcesso, viewerId }) {
  const router = useRouter();
  const isSelf = viewerId === id;

  return (
    <>
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
          <Link href={`/admin/usuarios/${id}?modo=editar`} className={styles.btnEdit}>
            Editar
          </Link>
          <button type="button" onClick={() => router.back()} className={styles.btnBack}>
            Voltar
          </button>
        </div>
      </div>

      <AdminTools id={id} isSelf={isSelf} />
    </>
  );
}

/* ─── Modo edição ───────────────────────────────────────── */
function ModoEdit({ id, nome, email, perfilAcesso, viewerId }) {
  const [state, formAction, pending] = useActionState(atualizarUsuario, initialState);
  const router = useRouter();
  const isSelf = viewerId === id;

  return (
    <>
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
          <select name="perfil_acesso" required defaultValue={perfilAcesso} className={styles.select}>
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
          <button type="button" onClick={() => router.back()} className={styles.btnEdit}>
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

      <AdminTools id={id} isSelf={isSelf} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function PerfilUsuario({ id, nome, email, perfilAcesso, editar, viewerId }) {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.center}>
          {editar ? (
            <ModoEdit
              id={id}
              nome={nome}
              email={email}
              perfilAcesso={perfilAcesso}
              viewerId={viewerId}
            />
          ) : (
            <ModoView
              id={id}
              nome={nome}
              email={email}
              perfilAcesso={perfilAcesso}
              viewerId={viewerId}
            />
          )}
        </div>
        <SidebarActions />
      </div>
    </div>
  );
}
