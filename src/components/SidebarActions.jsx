import Link from "next/link";
import { FaPaw, FaFileCirclePlus, FaUserPlus, FaUsers } from "react-icons/fa6";
import styles from "./SidebarActions.module.css";

const BUTTONS = [
  { label: "Adicionar\nPet",      Icon: FaPaw,            href: "/animais/cadastro", color: "gold"  },
  { label: "Cadastrar\nadoção",   Icon: FaFileCirclePlus, href: "/adocoes/cadastro", color: "green" },
  { label: "Adicionar\nUsuário",  Icon: FaUserPlus,       href: "/usuarios/novo",    color: "green" },
  { label: "Gerenciar\nUsuários", Icon: FaUsers,          href: "/usuarios",         color: "green" },
];

/**
 * @param {string} active - href da página atual, para destacar o botão ativo
 * @param {boolean} podeAnimal - esconde "Adicionar Pet" se o perfil não tiver permissão
 */
export function SidebarActions({ active, podeAnimal = true }) {
  return (
    <aside className={styles.sidebar}>
      {BUTTONS.map(({ label, Icon, href, color }) => {
        if (color === "gold" && !podeAnimal) return null;

        const isActive = active === href;

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.btn} ${styles[color]} ${isActive ? styles.active : ""}`}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}