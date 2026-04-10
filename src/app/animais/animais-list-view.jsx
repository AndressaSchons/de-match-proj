"use client";

import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./animais-list-view.module.css";

export default function AnimaisListView({ animais, podeAnimal, isAdmin }) {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Animais</h1>
            {podeAnimal ? (
              <Link href="/animais/cadastro" className={styles.btnCadastro}>
                Cadastrar animal
              </Link>
            ) : null}
          </div>

          <div className={styles.list}>
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

        <SidebarActions podeAnimal={podeAnimal} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
