/** @param {Record<string, unknown>} row linha `animal` do Supabase */
export function animalRowToFormDefaults(row) {
  return {
    nome_animal: row.nome_animal ?? "",
    foto: row.foto,
    sexo: row.sexo,
    porte: row.porte,
    castrado: row.castrado,
    disponibilidade: row.disponibilidade ?? "",
    data_nascimento: row.data_nascimento ? String(row.data_nascimento).slice(0, 10) : "",
    raca: row.raca,
    descricao_historia: row.descricao_historia,
    observacoes: row.observacoes,
    vacinacao: row.vacinacao,
    localizacao: row.localizacao,
  };
}
