"use client";

import Link from "next/link";
import { SidebarActions } from "@/components/SidebarActions";
import { AnimalCard } from "@/components/AnimalCard";
import { MetricsCard } from "@/components/MetricsCard";
import { NotificationCard } from "@/components/NotificationCard";
import styles from "./home-view.module.css";

export default function HomeView({
  animais,
  podeAnimal,
  isAdmin,
  metricas = null,
  notificacoesNovos = [],
  notificacoesIncompletos = [],
}) {
  return (
    <div className={styles.page}>
      <div className={styles.body}>

        {/* ── Esquerda: Notificações + Métricas ── */}
        <aside className={styles.leftPanel}>
          <div className={styles.panelBox}>
            <h2 className={styles.panelTitle}>Notificações</h2>
            {notificacoesNovos.length === 0 ? (
              <p className={styles.notifEmpty}>Nenhum animal novo nos últimos 3 dias.</p>
            ) : (
              notificacoesNovos.map((n) => (
                <NotificationCard
                  key={`novo-${n.id}`}
                  tipo={n.tipo}
                  mensagem={n.mensagem}
                  href={n.href}
                />
              ))
            )}
            {notificacoesIncompletos.length === 0 ? (
              <p className={styles.notifEmpty}>Nenhum cadastro incompleto.</p>
            ) : (
              notificacoesIncompletos.map((n) => (
                <NotificationCard
                  key={`incompleto-${n.id}`}
                  tipo={n.tipo}
                  mensagem={n.mensagem}
                  href={n.href}
                />
              ))
            )}
          </div>

          {metricas != null ? (
            <div className={`${styles.panelBox} ${styles.metricsBox}`}>
              <h2 className={styles.panelTitle}>Métricas</h2>
              <MetricsCard
                totalGeral={metricas.totalGeral}
                anoReferencia={metricas.anoReferencia}
                porAno={metricas.porAno}
                porMesAnoAtual={metricas.porMesAnoAtual}
              />
            </div>
          ) : null}
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
              animais.map((a) => (
                <AnimalCard
                  key={a.id_animal}
                  animal={a}
                  hrefDetalhe={`/animais/${a.id_animal}`}
                />
              ))
            )}
          </div>
        </main>

        {/* ── Direita: Ações — sem active, nenhum botão destacado ── */}
        <SidebarActions podeAnimal={podeAnimal} isAdmin={isAdmin} />
      </div>
    </div>
  );
}