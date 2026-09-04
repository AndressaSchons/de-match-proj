/**
 * Galeria do animal em ordem de exibição, com a capa (`foto`) sempre em primeiro.
 * Tolera linhas antigas, gravadas antes da coluna `fotos` existir.
 * @param {Record<string, unknown>} row linha `animal` do Supabase
 * @returns {string[]}
 */
export function normalizarFotos(row) {
  const capa = typeof row?.foto === "string" ? row.foto.trim() : "";
  const lista = Array.isArray(row?.fotos) ? row.fotos : [];

  const vistas = new Set();
  const fotos = [];
  for (const item of [capa, ...lista]) {
    const url = typeof item === "string" ? item.trim() : "";
    if (url === "" || vistas.has(url)) continue;
    vistas.add(url);
    fotos.push(url);
  }
  return fotos;
}

/** @param {Record<string, unknown>} row linha `animal` do Supabase */
export function animalRowToFormDefaults(row) {
  return {
    nome_animal: row.nome_animal ?? "",
    foto: row.foto,
    fotos: normalizarFotos(row),
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
