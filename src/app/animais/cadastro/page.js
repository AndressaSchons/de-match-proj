import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import { CadastroAnimalForm } from "./cadastro-animal-form";

export const metadata = {
  title: "Cadastrar animal",
};

export default async function CadastroAnimalPage() {
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

  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    return (
      <main style={{ maxWidth: 560, margin: "2rem auto", padding: "1rem" }}>
        <h1>Cadastrar animal</h1>
        <p style={{ color: "#b91c1c", marginTop: "0.75rem" }}>
          Seu perfil de acesso não inclui cadastro de animais. Voluntários, validadores e administradores
          podem usar esta tela.
        </p>
        <Link href="/" style={{ display: "inline-block", marginTop: "1rem" }}>
          Voltar ao início
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "0.35rem" }}>Cadastrar animal</h1>
      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
        Preencha os dados do pet. Campos obrigatórios são validados no navegador e no servidor.
      </p>
      <CadastroAnimalForm />
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Início</Link>
      </p>
    </main>
  );
}
