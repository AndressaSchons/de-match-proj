/** Valores usados quando a tabela ainda não existe ou a linha não foi criada. */
export const CONFIGURACAO_PADRAO = Object.freeze({
  metricas_somente_com_termo: false,
  termo_obrigatorio: false,
  nome_ong: "",
});

/** Título da barra de navegação: "GAPA" ou "GAPA - [nome da ONG]". */
export function tituloSistema(nomeOng) {
  const nome = String(nomeOng ?? "").trim();
  return nome ? `GAPA - ${nome}` : "GAPA";
}

/**
 * Lê `configuracao_sistema` (linha id = 1). Em caso de erro (ex.: script SQL não rodado),
 * devolve os valores padrão para o app continuar funcionando.
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @returns {Promise<{ metricas_somente_com_termo: boolean, termo_obrigatorio: boolean, nome_ong: string }>}
 */
export async function carregarConfiguracaoSistema(supabase) {
  const { data, error } = await supabase
    .from("configuracao_sistema")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return { ...CONFIGURACAO_PADRAO };

  return {
    metricas_somente_com_termo: data.metricas_somente_com_termo === true,
    termo_obrigatorio: data.termo_obrigatorio === true,
    nome_ong: typeof data.nome_ong === "string" ? data.nome_ong : "",
  };
}
