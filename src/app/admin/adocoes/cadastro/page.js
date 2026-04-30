import { createClient } from "@/utils/supabase/server";
import { CadastroAdocaoForm } from "./cadastro-adocao-form";

export const metadata = {
  title: "Cadastrar adoção",
};

export default async function CadastroAdocaoPage() {
  const supabase = await createClient();
  const { data: animais } = await supabase
    .from("animal")
    .select("id_animal,nome_animal,disponibilidade")
    .eq("disponibilidade", "disponivel")
    .order("nome_animal", { ascending: true });

  return <CadastroAdocaoForm animais={animais ?? []} />;
}
