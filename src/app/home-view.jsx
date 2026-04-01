"use client";

import Link from "next/link";
import { SidebarActions } from "@/components/SidebarActions";
import { AnimalCard } from "@/components/AnimalCard";
import { NotificationCard } from "@/components/NotificationCard";
import styles from "./home-view.module.css";

export default function HomeView({ animais, podeAnimal }) {
  return (
    <div className={styles.page}>
      <div className={styles.body}>

        {/* ── Esquerda: Notificações + Métricas ── */}
        <aside className={styles.leftPanel}>
          <div className={styles.panelBox}>
            <h2 className={styles.panelTitle}>Notificações</h2>
          <NotificationCard tipo="animal" mensagem="Novo animal cadastrado." />
            <NotificationCard tipo="alerta" mensagem="Animal precisando de informações" />
          </div>

          <div className={`${styles.panelBox} ${styles.metricsBox}`}>
            <h2 className={styles.panelTitle}>Métricas</h2>
          </div>
        </aside>

        {/* ── Centro: Lista de animais ── */}
        <main className={styles.centerPanel}>
          <div className={styles.centerHeader}>
            <h2 className={styles.centerTitle}>Animais</h2>
            <Link href="/animais" className={styles.verTodos}>Ver todos</Link>
          </div>

          <div className={styles.animalList}>
            {animais.length === 0 ? (
              <p className={styles.empty}>Nenhum animal cadastrado.</p>
            ) : (
              animais.map((a) => <AnimalCard key={a.id} animal={a} />)
            )}
          </div>
        </main>

        {/* ── Direita: Ações ── */}
        <SidebarActions active="/" podeAnimal={podeAnimal} />
      </div>
    </div>
  );
}