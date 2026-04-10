"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaPaw, FaFileCirclePlus, FaUserPlus, FaUsers } from "react-icons/fa6";
import styles from "./SidebarActions.module.css";

const BUTTONS = /** @type {const} */ ([
  {
    scope: "pet",
    label: "Adicionar\nPet",
    Icon: FaPaw,
    href: "/animais/cadastro",
    color: "green",
  },
  {
    scope: "admin",
    label: "Cadastrar\nadoção",
    Icon: FaFileCirclePlus,
    href: "/admin/adocoes/cadastro",
    color: "green",
  },
  {
    scope: "admin",
    label: "Adicionar\nUsuário",
    Icon: FaUserPlus,
    href: "/admin/usuarios/cadastro",
    color: "green",
  },
  {
    scope: "admin",
    label: "Gerenciar\nUsuários",
    Icon: FaUsers,
    href: "/admin/usuarios/gerenciar",
    color: "green",
  },
]);

function isPetFlowPathname(pathname) {
  if (pathname === "/animais/cadastro") return true;
  return /^\/animais\/\d+\/editar$/.test(pathname);
}

/**
 * Barra lateral de atalhos. Escopos:
 * - `pet`: cadastro de animal — exige `podeAnimal`
 * - `admin`: rotas sob `/admin` — exige `isAdmin`
 *
 * @param {object} props
 * @param {boolean} [props.podeAnimal=true] — perfis que podem cadastrar animal
 * @param {boolean} [props.isAdmin=false] — administrador (usuários / futuras rotas admin na barra)
 */
export function SidebarActions({ podeAnimal = true, isAdmin = false }) {
  const pathname = usePathname();
  const petFlow = isPetFlowPathname(pathname);

  return (
    <aside className={styles.sidebar}>
      {BUTTONS.map(({ scope, label, Icon, href, color }) => {
        if (scope === "pet" && !podeAnimal) return null;
        if (scope === "admin" && !isAdmin) return null;

        const isActive = href === "/animais/cadastro" ? petFlow : pathname === href;

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
