import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { FaHouse, FaCircleUser, FaRightFromBracket, FaUsersGear } from "react-icons/fa6";
import { isAdministrador } from "@/lib/permissions";
import styles from "./AppNav.module.css";

export async function AppNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfilNav } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const showAdminNav = isAdministrador(perfilNav?.perfil_acesso);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.title}>ONG</Link>

      <nav className={styles.icons}>
        <Link href="/" className={styles.icon} title="Início"><FaHouse /></Link>
        {showAdminNav ? (
          <Link
            href="/admin/usuarios/gerenciar"
            className={styles.icon}
            title="Administração"
          >
            <FaUsersGear />
          </Link>
        ) : null}
        <Link href="/conta" className={styles.icon} title="Perfil"><FaCircleUser /></Link>
        <form action={signOutAction} style={{ display: "inline" }}>
          <button type="submit" className={styles.icon} title="Sair"><FaRightFromBracket /></button>
        </form>
      </nav>
    </header>
  );
}