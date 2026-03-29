import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const podeAnimal = podeCadastrarAnimal(perfil?.perfil_acesso);

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1>Sistema de gerenciamento de canil</h1>
      <p style={{ marginTop: "0.5rem" }}>
        Sessão: <strong>{user.email}</strong>
      </p>

      {podeAnimal ? (
        <p style={{ marginTop: "1rem" }}>
          <Link href="/animais/cadastro">Cadastrar novo animal →</Link>
        </p>
      ) : null}

      <p style={{ marginTop: "1rem" }}>
        <Link href="/conta">Conta →</Link>
      </p>

      <form action={signOutAction} style={{ marginTop: "1.5rem" }}>
        <button type="submit" style={{ padding: "0.6rem 1rem", cursor: "pointer" }}>
          Sair
        </button>
      </form>
    </main>
  );
}