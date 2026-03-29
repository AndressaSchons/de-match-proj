import { createClient } from "@/utils/supabase/server";
import { CriarContaForm } from "./criar-conta-form";

export const metadata = {
  title: "Criar usuário · Admin",
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfil")
    .select("nome_completo, perfil_acesso")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const debug = [
    `email: ${user?.email ?? "—"}`,
    `id (auth): ${user?.id ?? "—"}`,
    `perfil.perfil_acesso: ${perfil?.perfil_acesso ?? "—"}`,
    `perfil.nome_completo: ${perfil?.nome_completo ?? "—"}`,
  ].join("\n");

  return (
    <main>
      <section
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.8rem",
          background: "#f4f4f5",
          padding: "0.75rem",
          marginBottom: "1rem",
          border: "1px solid #d4d4d8",
        }}
      >
        <strong>Sessão (validação rápida)</strong>
        <pre style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{debug}</pre>
      </section>

      <h1 style={{ margin: "0 0 0.35rem" }}>Criar conta</h1>
      <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>
        Formulário interno. Precisa de <code>SUPABASE_SERVICE_ROLE_KEY</code> no <code>.env.local</code> (veja
        README).
      </p>
      <CriarContaForm />
    </main>
  );
}
