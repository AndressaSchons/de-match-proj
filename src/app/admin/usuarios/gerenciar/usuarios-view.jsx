"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FaMagnifyingGlass, FaEye, FaPen, FaCircleUser } from "react-icons/fa6";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./usuarios-view.module.css";

const PERFIL_CONFIG = {
  voluntario: { label: "Voluntário", cls: "badgeVoluntario" },
  administrador: { label: "Administrador", cls: "badgeAdministrador" },
  validador: { label: "Validador", cls: "badgeValidador" },
};

const FILTROS = ["voluntario", "administrador", "validador"];

function PerfilBadge({ perfil }) {
  const config = PERFIL_CONFIG[perfil] ?? { label: perfil, cls: "badgeVoluntario" };
  return <span className={`${styles.badge} ${styles[config.cls]}`}>{config.label}</span>;
}

function UsuarioRow({ usuario }) {
  return (
    <div className={styles.row}>
      <FaCircleUser className={styles.rowIcon} />
      <span className={styles.rowName}>{usuario.nome ?? "—"}</span>
      <div className={styles.rowRight}>
        <PerfilBadge perfil={usuario.perfil_acesso} />
        <div className={styles.rowActions}>
          <Link href={`/admin/usuarios/${usuario.id}`} className={styles.actionBtn} title="Visualizar">
            <FaEye />
          </Link>
          <Link href={`/admin/usuarios/${usuario.id}?modo=editar`} className={styles.actionBtn} title="Editar">
            <FaPen />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosView({ usuarios, listError }) {
  const [filtrosAtivos, setFiltrosAtivos] = useState([]);
  const [busca, setBusca] = useState("");

  function toggleFiltro(perfil) {
    setFiltrosAtivos((prev) =>
      prev.includes(perfil) ? prev.filter((f) => f !== perfil) : [...prev, perfil]
    );
  }

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchFiltro = filtrosAtivos.length === 0 || filtrosAtivos.includes(u.perfil_acesso);
      const matchBusca = busca.trim() === "" ||
        (u.nome ?? "").toLowerCase().includes(busca.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(busca.toLowerCase());
      return matchFiltro && matchBusca;
    });
  }, [usuarios, filtrosAtivos, busca]);

  const hasFilters = filtrosAtivos.length > 0 || busca.trim();

  return (
    <div className="pageLayout">
      <div className="pageBody" data-page-body>

        {/* ── Filtros ── */}
        <aside className={styles.leftPanel}>
          <div className={styles.filterBox}>
            <div className={styles.filterHeader}>
              <h2 className={styles.filterTitle}>Filtros</h2>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => { setFiltrosAtivos([]); setBusca(""); }}
                  style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-green)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  Limpar
                </button>
              ) : null}
            </div>
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Busca por nome</p>
              <div className={styles.searchWrap}>
                <FaMagnifyingGlass className={styles.searchIcon} />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome ou email…"
                  className={styles.searchInput}
                />
              </div>
            </div>
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Perfil</p>
              <div className={styles.filterBadges}>
                {FILTROS.map((perfil) => {
                  const config = PERFIL_CONFIG[perfil];
                  const ativo = filtrosAtivos.includes(perfil);
                  return (
                    <button
                      key={perfil}
                      onClick={() => toggleFiltro(perfil)}
                      className={`${styles.filterBtn} ${styles[config.cls]} ${ativo ? styles.filterActive : styles.filterInactive}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>


          </div>
        </aside>

        {/* ── Lista ── */}
        <main className={styles.centerPanel}>
          <div className={styles.centerHeader}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem" }}>
              <h2 className={styles.centerTitle}>Usuários</h2>
              <span className={styles.count}>
                {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>
          </div>

          {listError ? (
            <p className={styles.listError} role="alert">{listError}</p>
          ) : null}

          <div className={styles.list}>
            {usuariosFiltrados.length === 0 ? (
              <p className={styles.empty}>Nenhum usuário encontrado.</p>
            ) : (
              usuariosFiltrados.map((u) => <UsuarioRow key={u.id} usuario={u} />)
            )}
          </div>
        </main>

        <SidebarActions isAdmin podeAnimal />
      </div>
    </div>
  );
}