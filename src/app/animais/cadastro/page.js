import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import { isAdministrador, podeCadastrarAdocao } from "@/lib/permissions";
import { carregarConfiguracaoSistema } from "@/lib/configuracao-sistema";
import { CadastroAnimalForm } from "./cadastro-animal-form";

export const metadata = {
  title: "Cadastro Pet",
};

export default async function CadastroAnimalPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    redirect("/");
  }

  const { termo_obrigatorio } = await carregarConfiguracaoSistema(supabase);

  return (
    <CadastroAnimalForm
      isAdmin={isAdministrador(perfil?.perfil_acesso)}
      podeAdocao={podeCadastrarAdocao(perfil?.perfil_acesso)}
      podeAnimal
      termoObrigatorio={termo_obrigatorio}
    />
  );
}