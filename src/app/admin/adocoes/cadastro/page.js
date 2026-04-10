import Link from "next/link";
import { SidebarActions } from "@/components/SidebarActions";
import styles from "./cadastro-adocao-placeholder.module.css";

export const metadata = {
  title: "Cadastrar adoção",
};

/** Página reservada ao fluxo de adoção; conteúdo será preenchido depois. */
export default function CadastroAdocaoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <main className={styles.center}>
          <div className={styles.card}>
            <h1 className={styles.title}>Cadastrar adoção</h1>
            <p className={styles.lead}>
              Implementação em breve.
            </p>
            <Link href="/" className={styles.back}>
              Voltar ao início
            </Link>
          </div>
        </main>
        <SidebarActions isAdmin podeAnimal />
      </div>
    </div>
  );
}
