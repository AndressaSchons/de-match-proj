"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { salvarConfiguracoes } from "./actions";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./configuracoes.module.css";

const initialState = { ok: undefined, message: "" };

const OPCOES = [
  {
    name: "metricas_somente_com_termo",
    titulo: "Métricas de adoção a partir do termo",
    descricao:
      "Ligado: as métricas da página inicial contam apenas adoções com termo anexado. " +
      "Desligado: contam todas as adoções cadastradas, inclusive as que aguardam termo.",
  },
  {
    name: "termo_obrigatorio",
    titulo: "Termo de adoção obrigatório",
    descricao:
      "Ligado: não é possível cadastrar uma adoção sem anexar o termo. " +
      "Desligado: a adoção pode ser salva sem termo e fica \"Aguardando termo de adoção\".",
  },
];

export function ConfiguracoesForm({ configuracao }) {
  const [state, formAction, pending] = useActionState(salvarConfiguracoes, initialState);
  const router = useRouter();

  return (
    <div className="pageLayout">
      <div className={`pageBody ${styles.bodyCenter}`} data-page-body>
        <div className={styles.center}>
          <form action={formAction} className={styles.card}>
            <div className={styles.toolbar}>
              <button type="button" onClick={() => router.back()} className={styles.backBtn}>
                ← Voltar
              </button>
              <h1 className={styles.title}>Configurações do sistema</h1>
            </div>

            <p className={styles.sectionTitle}>Identificação</p>

            <label className={styles.field}>
              <span className={styles.optionTitle}>Nome da ONG</span>
              <input
                type="text"
                name="nome_ong"
                maxLength={80}
                defaultValue={configuracao.nome_ong}
                disabled={pending}
                placeholder="Ex.: Amigos dos Animais"
                autoComplete="off"
                className={styles.input}
              />
              <span className={styles.optionDesc}>
                Aparece na barra de navegação como &quot;GAPA - [nome da ONG]&quot;. Em branco, mostra só &quot;GAPA&quot;.
              </span>
            </label>

            <p className={styles.sectionTitle}>Adoções</p>

            {OPCOES.map((op) => (
              <label key={op.name} className={styles.option}>
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>{op.titulo}</span>
                  <span className={styles.optionDesc}>{op.descricao}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  name={op.name}
                  defaultChecked={configuracao[op.name]}
                  disabled={pending}
                  className={styles.toggle}
                />
              </label>
            ))}

            {state?.message ? (
              <div className={state.ok ? styles.feedbackOk : styles.feedbackError} role="status">
                <span className={styles.feedbackIcon}>{state.ok ? "✓" : "✕"}</span>
                {state.message}
              </div>
            ) : null}

            <div className={styles.actions}>
              <button type="button" onClick={() => router.back()} className={styles.btnCancel}>
                Cancelar
              </button>
              <button type="submit" disabled={pending} className={styles.btnSave}>
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </div>

        <SidebarActions isAdmin podeAnimal />
      </div>
    </div>
  );
}
