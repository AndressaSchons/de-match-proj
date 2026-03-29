import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";

export async function AppNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = perfil?.perfil_acesso === "administrador";
  const podeAnimal = podeCadastrarAnimal(perfil?.perfil_acesso);

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "0.75rem 1rem",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <strong style={{ marginRight: "auto" }}>de-match</strong>
      <Link href="/">Início</Link>
      {podeAnimal ? <Link href="/animais/cadastro">Cadastrar animal</Link> : null}
      <Link href="/conta">Conta</Link>
      {isAdmin ? <Link href="/admin/usuarios">Criar usuário</Link> : null}
    </header>
  );
}
