import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { aggregateAdocaoMetrics } from "@/lib/adocao-metrics";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import {
  buildNotificacoesIncompletos,
  buildNotificacoesNovosAnimais,
  dataCadastroDesdeNovosAnimais,
  isAnimalCadastroIncompleto,
  LIMITE_INCOMPLETOS,
  LIMITE_NOVOS_ANIMAL,
  LOTE_BUSCA_INCOMPLETOS,
} from "@/lib/notificacoes-animais";
import { isAdministrador, podeCadastrarAdocao, podeVerMetricasAdocao } from "@/lib/permissions";
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
    .limit(5); // ← 5 animais

  const desde = dataCadastroDesdeNovosAnimais();
  const { data: animaisNovos } = await supabase
    .from("animal")
    .select("id_animal, nome_animal, data_cadastro")
    .gte("data_cadastro", desde)
    .order("data_cadastro", { ascending: false })
    .limit(LIMITE_NOVOS_ANIMAL);

  const notificacoesNovos = buildNotificacoesNovosAnimais(animaisNovos ?? []);

  const { data: animaisLote } = await supabase
    .from("animal")
    .select(
      "id_animal, nome_animal, foto, sexo, porte, data_nascimento, raca, descricao_historia, vacinacao, localizacao, data_cadastro"
    )
    .order("data_cadastro", { ascending: false })
    .limit(LOTE_BUSCA_INCOMPLETOS);

  const incompletos = (animaisLote ?? [])
    .filter(isAnimalCadastroIncompleto)
    .slice(0, LIMITE_INCOMPLETOS);

  const notificacoesIncompletos = buildNotificacoesIncompletos(incompletos);

  const podeAnimal = podeCadastrarAnimal(perfil?.perfil_acesso);
  const podeAdocao = podeCadastrarAdocao(perfil?.perfil_acesso);
  const isAdmin = isAdministrador(perfil?.perfil_acesso);

  let metricas = null;
  if (podeVerMetricasAdocao(perfil?.perfil_acesso)) {
    const { data: adocoes } = await supabase.from("adocao").select("data_operacao, data_adocao");
    const datas = (adocoes ?? []).map((a) => a.data_adocao ?? a.data_operacao);
    metricas = aggregateAdocaoMetrics(datas);
  }

  return (
    <HomeView
      animais={animais ?? []}
      podeAnimal={podeAnimal}
      podeAdocao={podeAdocao}
      isAdmin={isAdmin}
      metricas={metricas}
      notificacoesNovos={notificacoesNovos}
      notificacoesIncompletos={notificacoesIncompletos}
    />
  );
}