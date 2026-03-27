import { redirect } from "next/navigation";
import { signOutAction } from "./actions";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1>Projeto com Next.js + Supabase</h1>
      <p style={{ marginTop: "0.5rem" }}>
        Sessão ativa com o usuário: <strong>{user.email}</strong>
      </p>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        Esta base já está pronta para login, logout e proteção de rota.
      </p>

      <form action={signOutAction} style={{ marginTop: "1.5rem" }}>
        <button type="submit" style={{ padding: "0.6rem 1rem", cursor: "pointer" }}>
          Sair
        </button>
      </form>
    </main>
  );
}