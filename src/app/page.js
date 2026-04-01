import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import HomeView from "./home-view";

export const metadata = {
  title: "Início – ONG",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const { data: animais } = await supabase
    .from("animal")
    .select("id, nome_animal, disponibilidade, sexo, porte, foto")
    .order("criado_em", { ascending: false })
    .limit(3);

  const podeAnimal = podeCadastrarAnimal(perfil?.perfil_acesso);

  return (
    <HomeView
      user={user}
      perfil={perfil}
      animais={animais ?? []}
      podeAnimal={podeAnimal}
    />
  );
}