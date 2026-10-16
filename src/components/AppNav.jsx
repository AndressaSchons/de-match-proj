import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { FaHouse, FaCircleUser, FaRightFromBracket, FaUsersGear, FaGear } from "react-icons/fa6";
import { isAdministrador } from "@/lib/permissions";
import { carregarConfiguracaoSistema, tituloSistema } from "@/lib/configuracao-sistema";
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
  const { nome_ong } = await carregarConfiguracaoSistema(supabase);
  const titulo = tituloSistema(nome_ong);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.title} title={titulo}>{titulo}</Link>

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
        {showAdminNav ? (
          <Link href="/admin/configuracoes" className={styles.icon} title="Configurações do sistema">
            <FaGear />
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