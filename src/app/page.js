import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { aggregateAdocaoMetrics } from "@/lib/adocao-metrics";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import { isAdministrador, podeVerMetricasAdocao } from "@/lib/permissions";
import HomeView from "./home-view";

export const metadata = {
  title: "Início – ONG",
};

export default async function HomePage() {
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
    .order("data_cadastro", { ascending: false })
    .limit(3);

  const podeAnimal = podeCadastrarAnimal(perfil?.perfil_acesso);
  const isAdmin = isAdministrador(perfil?.perfil_acesso);

  let metricas = null;
  if (podeVerMetricasAdocao(perfil?.perfil_acesso)) {
    const { data: adocoes } = await supabase.from("adocao").select("data_operacao");
    const datas = (adocoes ?? []).map((a) => a.data_operacao);
    metricas = aggregateAdocaoMetrics(datas);
  }

  return (
    <HomeView
      animais={animais ?? []}
      podeAnimal={podeAnimal}
      isAdmin={isAdmin}
      metricas={metricas}
    />
  );
}
