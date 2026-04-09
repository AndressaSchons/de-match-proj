"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { excluirAnimal } from "../actions";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./animal-detail-view.module.css";

const initialState = { ok: undefined, message: "" };

function labelDisponibilidade(value) {
  return DISPONIBILIDADE.find((d) => d.value === value)?.label ?? value ?? "—";
}

export function AnimalDetailView({ animal, podeEditar, podeExcluir, podeAnimal }) {
  const router = useRouter();
  const [delState, delAction, delPending] = useActionState(excluirAnimal, initialState);

  function confirmDelete(e) {
    if (!confirm("Excluir este animal permanentemente?")) {
      e.preventDefault();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <button type="button" onClick={() => router.back()} className={styles.btnGhost}>
              Voltar
            </button>
            <div className={styles.toolbarActions}>
              {podeEditar ? (
                <Link href={`/animais/${animal.id_animal}/editar`} className={styles.btnPrimary}>
                  Editar
                </Link>
              ) : null}
              {podeExcluir ? (
                <form action={delAction} className={styles.inlineForm} onSubmit={confirmDelete}>
                  <input type="hidden" name="id_animal" value={String(animal.id_animal)} />
                  <button type="submit" disabled={delPending} className={styles.btnDanger}>
                    {delPending ? "Excluindo…" : "Excluir"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          <h1 className={styles.title}>{animal.nome_animal}</h1>

          {animal.foto ? (
            <div className={styles.hero}>
              <img src={animal.foto} alt="" className={styles.heroImg} />
            </div>
          ) : null}

          <dl className={styles.dl}>
            <dt>Situação</dt>
            <dd>{labelDisponibilidade(animal.disponibilidade)}</dd>
            <dt>Sexo</dt>
            <dd>{animal.sexo === "macho" ? "Macho" : animal.sexo === "femea" ? "Fêmea" : "—"}</dd>
            <dt>Porte</dt>
            <dd>
              {animal.porte === "pequeno"
                ? "Pequeno"
                : animal.porte === "medio"
                  ? "Médio"
                  : animal.porte === "grande"
                    ? "Grande"
                    : "—"}
            </dd>
            <dt>Castração</dt>
            <dd>{animal.castrado ? "Sim" : "Não"}</dd>
            <dt>Data de nascimento</dt>
            <dd>
              {animal.data_nascimento
                ? String(animal.data_nascimento).slice(0, 10)
                : "—"}
            </dd>
            <dt>Raça / cor</dt>
            <dd>{animal.raca ?? "—"}</dd>
            <dt>Cadastrado em</dt>
            <dd>
              {animal.data_cadastro
                ? new Date(animal.data_cadastro).toLocaleString("pt-BR")
                : "—"}
            </dd>
            <dt>Localização</dt>
            <dd>{animal.localizacao ?? "—"}</dd>
            <dt>Vacinação</dt>
            <dd>{animal.vacinacao ?? "—"}</dd>
          </dl>

          {animal.descricao_historia ? (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>História</h2>
              <p className={styles.blockText}>{animal.descricao_historia}</p>
            </section>
          ) : null}

          {animal.observacoes ? (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Observações</h2>
              <p className={styles.blockText}>{animal.observacoes}</p>
            </section>
          ) : null}

          {delState?.message ? (
            <p className={delState.ok ? styles.msgOk : styles.msgError} role="status">
              {delState.message}
            </p>
          ) : null}
        </main>

        <SidebarActions podeAnimal={podeAnimal} />
      </div>
    </div>
  );
}
