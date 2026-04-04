import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
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

  return <CadastroAnimalForm />;
}