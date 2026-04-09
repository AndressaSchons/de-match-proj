import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import AnimaisListView from "./animais-list-view";

export const metadata = {
  title: "Animais",
};

export default async function AnimaisPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const { data: animais } = await supabase
    .from("animal")
    .select("id_animal, nome_animal, disponibilidade, sexo, porte, foto")
    .order("data_cadastro", { ascending: false });

  return (
    <AnimaisListView
      animais={animais ?? []}
      podeAnimal={podeCadastrarAnimal(perfil?.perfil_acesso)}
    />
  );
}
