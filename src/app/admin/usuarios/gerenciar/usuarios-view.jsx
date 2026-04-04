"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FaMagnifyingGlass, FaEye, FaPen, FaCircleUser } from "react-icons/fa6";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./usuarios-view.module.css";

/* ─── perfil badge config ───────────────────────────────── */
const PERFIL_CONFIG = {
  voluntario:    { label: "Voluntário",    cls: "badgeVoluntario"    },
  administrador: { label: "Administrador", cls: "badgeAdministrador" },
  validador:     { label: "Validador",     cls: "badgeValidador"     },
};

function PerfilBadge({ perfil }) {
  const config = PERFIL_CONFIG[perfil] ?? { label: perfil, cls: "badgeVoluntario" };
  return (
    <span className={`${styles.badge} ${styles[config.cls]}`}>
      {config.label}
    </span>
  );
}

/* ─── single user row ───────────────────────────────────── */
function UsuarioRow({ usuario }) {
  return (
    <div className={styles.row}>
      <FaCircleUser className={styles.rowIcon} />
      <span className={styles.rowName}>{usuario.nome ?? usuario.email}</span>
      <PerfilBadge perfil={usuario.perfil_acesso} />
      <div className={styles.rowActions}>
        <Link href={`/admin/usuarios/${usuario.id}`} className={styles.actionBtn} title="Visualizar">
          <FaEye />
        </Link>
        <Link href={`/admin/usuarios/${usuario.id}/editar`} className={styles.actionBtn} title="Editar">
          <FaPen />
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
const FILTROS = ["voluntario", "administrador", "validador"];

export default function UsuariosView({ usuarios }) {
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
      const matchBusca  = busca.trim() === "" ||
        (u.nome ?? u.email ?? "").toLowerCase().includes(busca.toLowerCase());
      return matchFiltro && matchBusca;
    });
  }, [usuarios, filtrosAtivos, busca]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>

        {/* ── Filtros ── */}
        <aside className={styles.leftPanel}>
          <div className={styles.filterBox}>
            <h2 className={styles.filterTitle}>Filtros:</h2>

            <div className={styles.filterBadges}>
              {FILTROS.map((perfil) => {
                const config = PERFIL_CONFIG[perfil];
                const ativo  = filtrosAtivos.includes(perfil);
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

            <h2 className={styles.filterTitle} style={{ marginTop: "1.2rem" }}>Busca por nome:</h2>
            <div className={styles.searchWrap}>
              <FaMagnifyingGlass className={styles.searchIcon} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder=""
                className={styles.searchInput}
              />
            </div>
          </div>
        </aside>

        {/* ── Lista ── */}
        <main className={styles.centerPanel}>
          <h2 className={styles.centerTitle}>Usuários do sistema</h2>

          <div className={styles.list}>
            {usuariosFiltrados.length === 0 ? (
              <p className={styles.empty}>Nenhum usuário encontrado.</p>
            ) : (
              usuariosFiltrados.map((u) => <UsuarioRow key={u.id} usuario={u} />)
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <SidebarActions active="/admin/usuarios/gerenciar" />
      </div>
    </div>
  );
}