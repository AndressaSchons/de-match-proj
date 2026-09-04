import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import { isAdministrador, podeCadastrarAdocao } from "@/lib/permissions";
import { CadastroAdocaoForm } from "./cadastro-adocao-form";

export const metadata = {
  title: "Cadastrar adoção",
};

export default async function CadastroAdocaoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/adocoes/cadastro")}`);

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (!podeCadastrarAdocao(perfil?.perfil_acesso)) {
    redirect("/");
  }

  const { data: animais } = await supabase
    .from("animal")
    .select("id_animal,nome_animal,disponibilidade")
    .eq("disponibilidade", "disponivel")
    .order("nome_animal", { ascending: true });

  return (
    <CadastroAdocaoForm
      animais={animais ?? []}
      isAdmin={isAdministrador(perfil?.perfil_acesso)}
      podeAnimal={podeCadastrarAnimal(perfil?.perfil_acesso)}
    />
  );
}
