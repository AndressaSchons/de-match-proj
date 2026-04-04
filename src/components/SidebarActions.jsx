"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaPaw, FaFileCirclePlus, FaUserPlus, FaUsers } from "react-icons/fa6";
import styles from "./SidebarActions.module.css";

const BUTTONS = [
  { label: "Adicionar\nPet",      Icon: FaPaw,            href: "/animais/cadastro",         color: "green"  },
  { label: "Cadastrar\nadoção",   Icon: FaFileCirclePlus, href: "/admin/adocoes/cadastro",   color: "green" },
  { label: "Adicionar\nUsuário",  Icon: FaUserPlus,       href: "/admin/usuarios/cadastro",  color: "green" },
  { label: "Gerenciar\nUsuários", Icon: FaUsers,          href: "/admin/usuarios/gerenciar", color: "green" },
];

/**
 * @param {boolean} podeAnimal - esconde "Adicionar Pet" se o perfil não tiver permissão
 */
export function SidebarActions({ podeAnimal = true }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {BUTTONS.map(({ label, Icon, href, color }) => {
        if (color === "gold" && !podeAnimal) return null;

        const isActive = pathname === href;

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