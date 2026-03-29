import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { USER_TYPE_LABELS } from "@/lib/user-types";
import { ContaForm } from "./conta-form";

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil, error } = await supabase.from("perfil").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
        <h1>Conta</h1>
        <p style={{ color: "#b91c1c" }}>Não foi possível carregar o perfil: {error.message}</p>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Rode no Supabase, nesta ordem: <code>supabase/scripts/wipe_de_match.sql</code> e depois{" "}
          <code>recreate_de_match.sql</code> (veja o README).
        </p>
        <Link href="/" style={{ display: "inline-block", marginTop: "1rem" }}>
          Voltar ao início
        </Link>
      </main>
    );
  }

  const tipoLabel =
    perfil?.perfil_acesso && USER_TYPE_LABELS[perfil.perfil_acesso]
      ? USER_TYPE_LABELS[perfil.perfil_acesso]
      : "Voluntário";

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1>Conta</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        Papel atual: <strong>{tipoLabel}</strong> — use isso no app para liberar telas e ações.
      </p>

      <ContaForm email={user.email ?? ""} perfil={perfil} />
    </main>
  );
}
