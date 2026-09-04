"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./animais-list-view.module.css";

const SITUACOES = [
  { value: "disponivel",   label: "Disponível",   cls: "tagDisponivel" },
  { value: "em_processo",  label: "Em processo",  cls: "tagEmProcesso" },
  { value: "adotado",      label: "Adotado",      cls: "tagAdotado" },
  { value: "indisponivel", label: "Falecido",      cls: "tagIndisponivel" },
];

const SEXOS = [
  { value: "femea", label: "Fêmea" },
  { value: "macho", label: "Macho" },
];

const PORTES = [
  { value: "pequeno", label: "Pequeno" },
  { value: "medio",   label: "Médio"   },
  { value: "grande",  label: "Grande"  },
];

function toggle(set, value) {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

export default function AnimaisListView({ animais, podeAnimal, podeAdocao, isAdmin }) {
  const [busca, setBusca]         = useState("");
  const [situacoes, setSituacoes] = useState(new Set());
  const [sexos, setSexos]         = useState(new Set());
  const [portes, setPortes]       = useState(new Set());

  const filtered = useMemo(() => {
    return animais.filter((a) => {
      if (situacoes.size > 0 && !situacoes.has(a.disponibilidade)) return false;
      if (sexos.size    > 0 && !sexos.has(a.sexo))                 return false;
      if (portes.size   > 0 && !portes.has(a.porte))               return false;
      if (busca.trim()) {
        const q = busca.trim().toLowerCase();
        if (!a.nome_animal?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [animais, situacoes, sexos, portes, busca]);

  const hasFilters = situacoes.size > 0 || sexos.size > 0 || portes.size > 0 || busca.trim();

  function clearAll() {
    setSituacoes(new Set());
    setSexos(new Set());
    setPortes(new Set());
    setBusca("");
  }

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>

        {/* ── Filtros ── */}
        <aside className={styles.filterPanel}>
          <div className={styles.filterBox}>
            <div className={styles.filterHeader}>
              <span className={styles.filterTitle}>Filtros</span>
              {hasFilters ? (
                <button type="button" onClick={clearAll} className={styles.clearBtn}>
                  Limpar
                </button>
              ) : null}
            </div>

            {/* Busca */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Busca por nome</p>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="search"
                  placeholder="Nome do animal…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Situação */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Situação</p>
              <div className={styles.tagGroup}>
                {SITUACOES.map(({ value, label, cls }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSituacoes((s) => toggle(s, value))}
                    className={`${styles.tag} ${styles[cls]} ${situacoes.has(value) ? styles.tagActive : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sexo */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Sexo</p>
              <div className={styles.tagGroup}>
                {SEXOS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSexos((s) => toggle(s, value))}
                    className={`${styles.tag} ${styles.tagNeutral} ${sexos.has(value) ? styles.tagActive : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Porte */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Porte</p>
              <div className={styles.tagGroup}>
                {PORTES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPortes((s) => toggle(s, value))}
                    className={`${styles.tag} ${styles.tagNeutral} ${portes.has(value) ? styles.tagActive : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Lista ── */}
        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Animais</h1>
              <span className={styles.count}>
                {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>
            {podeAnimal ? (
              <Link href="/animais/cadastro" className={styles.btnCadastro}>
                + Cadastrar animal
              </Link>
            ) : null}
          </div>

          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🐾</span>
                <p className={styles.emptyText}>
                  {hasFilters ? "Nenhum animal encontrado com esses filtros." : "Nenhum animal cadastrado."}
                </p>
                {hasFilters ? (
                  <button type="button" onClick={clearAll} className={styles.emptyBtn}>
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            ) : (
              filtered.map((a) => (
                <AnimalCard
                  key={a.id_animal}
                  animal={a}
                  hrefDetalhe={`/animais/${a.id_animal}`}
                />
              ))
            )}
          </div>
        </main>

        <SidebarActions podeAnimal={podeAnimal} podeAdocao={podeAdocao} isAdmin={isAdmin} />
      </div>
    </div>
  );
}