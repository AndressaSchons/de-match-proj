"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { excluirAnimal } from "../actions";
import { normalizarFotos } from "../animal-map";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { SidebarActions } from "@/components/SidebarActions";
import { AnexarTermoForm } from "./anexar-termo-form";
import styles from "./animal-detail-view.module.css";

const initialState = { ok: undefined, message: "" };

function labelDisponibilidade(value) {
  return DISPONIBILIDADE.find((d) => d.value === value)?.label ?? value ?? "—";
}

export function AnimalDetailView({ animal, podeEditar, podeExcluir, podeAnimal, podeAdocao, isAdmin, termoAdocaoUrl, dataAdocao, aguardandoTermo = false }) {
  const router = useRouter();
  const [delState, delAction, delPending] = useActionState(excluirAnimal, initialState);

  const fotos = useMemo(() => normalizarFotos(animal), [animal]);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const fotoPrincipal = fotos[fotoAtiva] ?? fotos[0] ?? null;

  function confirmDelete(e) {
    if (!confirm("Excluir este animal permanentemente?")) {
      e.preventDefault();
    }
  }

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>
        <main className={styles.main}>

          {/* ── Toolbar ───────────────────────────────── */}
          <div className={styles.toolbar}>
            <button type="button" onClick={() => router.back()} className={styles.btnGhost}>
              ← Voltar
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

          {/* ── Name ──────────────────────────────────── */}
          <h1 className={styles.title}>{animal.nome_animal}</h1>

          {/* ── Hero card: photo + fields side by side ─ */}
          <div className={styles.heroCard}>
            {/* Photos */}
            <div className={styles.gallery}>
              <div className={styles.photoWrapper}>
                {fotoPrincipal ? (
                  <img src={fotoPrincipal} alt={animal.nome_animal} className={styles.heroImg} />
                ) : (
                  <div className={styles.photoPlaceholder}>🐾</div>
                )}
              </div>

              {fotos.length > 1 ? (
                <ul className={styles.thumbs}>
                  {fotos.map((url, i) => (
                    <li key={url}>
                      <button
                        type="button"
                        className={`${styles.thumbBtn} ${i === fotoAtiva ? styles.thumbBtnAtivo : ""}`}
                        aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                        aria-current={i === fotoAtiva}
                        onClick={() => setFotoAtiva(i)}
                      >
                        <img src={url} alt="" className={styles.thumbImg} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Fields */}
            <dl className={styles.dl}>
              <dt>Situação</dt>
              <dd>{labelDisponibilidade(animal.disponibilidade)}</dd>

              {dataAdocao ? (
                <>
                  <dt>Data da adoção</dt>
                  <dd>{String(dataAdocao).slice(0, 10).split("-").reverse().join("/")}</dd>
                </>
              ) : null}

              <dt>Sexo</dt>
              <dd>{animal.sexo === "macho" ? "Macho" : animal.sexo === "femea" ? "Fêmea" : "—"}</dd>

              <dt>Porte</dt>
              <dd>
                {animal.porte === "pequeno" ? "Pequeno"
                  : animal.porte === "medio" ? "Médio"
                  : animal.porte === "grande" ? "Grande"
                  : "—"}
              </dd>

              <dt>Castração</dt>
              <dd>{animal.castrado ? "Sim" : "Não"}</dd>

              <dt>Nascimento</dt>
              <dd>
                {animal.data_nascimento
                  ? String(animal.data_nascimento).slice(0, 10).split("-").reverse().join("/")
                  : "—"}
              </dd>


              <dt>Raça / cor</dt>
              <dd>{animal.raca ?? "—"}</dd>

              <dt>Localização</dt>
              <dd>{animal.localizacao ?? "—"}</dd>

              <dt>Vacinação</dt>
              <dd>{animal.vacinacao ?? "—"}</dd>

              <dt>Cadastrado em</dt>
              <dd>
                {animal.data_cadastro
                  ? new Date(animal.data_cadastro).toLocaleString("pt-BR")
                  : "—"}
              </dd>

              {/* Adoption term inline */}
              {typeof termoAdocaoUrl === "string" && termoAdocaoUrl ? (
                <dd className={styles.termRow}>
                  <svg className={styles.termIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className={styles.termLinks}>
                    <a href={termoAdocaoUrl} target="_blank" rel="noreferrer">Visualizar termo</a>
                    <a href={termoAdocaoUrl} download>Baixar</a>
                  </span>
                </dd>
              ) : aguardandoTermo ? (
                <dd className={styles.termRow}>
                  <span className={styles.termPending} role="status">
                    <span aria-hidden="true">⏳</span>
                    Aguardando termo de adoção
                  </span>
                </dd>
              ) : null}
            </dl>
          </div>

          {/* ── Anexar termo pendente ─────────────────── */}
          {aguardandoTermo && podeAdocao ? <AnexarTermoForm idAnimal={animal.id_animal} /> : null}

          {/* ── História ──────────────────────────────── */}
          {animal.descricao_historia ? (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>História</h2>
              <p className={styles.blockText}>{animal.descricao_historia}</p>
            </section>
          ) : null}

          {/* ── Observações ───────────────────────────── */}
          {animal.observacoes ? (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Observações</h2>
              <p className={styles.blockText}>{animal.observacoes}</p>
            </section>
          ) : null}

          {/* ── Delete feedback ───────────────────────── */}
          {delState?.message ? (
            <p className={delState.ok ? styles.msgOk : styles.msgError} role="status">
              {delState.message}
            </p>
          ) : null}

        </main>

        <SidebarActions podeAnimal={podeAnimal} podeAdocao={podeAdocao} isAdmin={isAdmin} />
      </div>
    </div>
  );
}