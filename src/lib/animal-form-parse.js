import {
  DISPONIBILIDADE,
  PORTE_VALUES,
  SEXO_VALUES,
} from "@/lib/animal-constants";

function strOrNull(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

/** Máximo de fotos por animal (o formulário também limita). */
export const MAX_FOTOS = 8;

/**
 * Lê os campos `fotos` do FormData: limpa vazios, remove repetidas e corta no limite.
 * @param {FormData} formData
 * @returns {string[]}
 */
export function parseFotos(formData) {
  const vistas = new Set();
  const fotos = [];
  for (const raw of formData.getAll("fotos")) {
    const url = String(raw ?? "").trim();
    if (url === "" || vistas.has(url)) continue;
    vistas.add(url);
    fotos.push(url);
    if (fotos.length >= MAX_FOTOS) break;
  }
  return fotos;
}

function parseCastrado(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "sim" || s === "on" || s === "true") return true;
  if (s === "nao") return false;
  return false;
}

/**
 * Monta objeto compatível com colunas de `public.animal` a partir do FormData.
 * @param {FormData} formData
 */
export function animalRowFromFormData(formData) {
  const nome_animal = String(formData.get("nome_animal") ?? "").trim();
  const disponibilidade = String(formData.get("disponibilidade") ?? "").trim();

  const sexoRaw = String(formData.get("sexo") ?? "").trim();
  const sexo = sexoRaw === "" ? null : sexoRaw;

  const porteRaw = String(formData.get("porte") ?? "").trim();
  const porte = porteRaw === "" ? null : porteRaw;

  const dataNascRaw = String(formData.get("data_nascimento") ?? "").trim();
  const data_nascimento = dataNascRaw === "" ? null : dataNascRaw;

  // A capa é sempre a primeira da galeria; `foto` continua alimentando cards e listagens.
  const fotos = parseFotos(formData);

  return {
    fotos,
    foto: fotos[0] ?? null,
    nome_animal,
    disponibilidade,
    sexo,
    porte,
    data_nascimento,
    raca: strOrNull(formData.get("raca")),
    descricao_historia: strOrNull(formData.get("descricao_historia")),
    castrado: parseCastrado(formData.get("castrado")),
    vacinacao: strOrNull(formData.get("vacinacao")),
    localizacao: strOrNull(formData.get("localizacao")),
    observacoes: strOrNull(formData.get("observacoes")),
  };
}

export function validateAnimalRow(row, { requireNome = true } = {}) {
  if (requireNome && !row.nome_animal) {
    return { ok: false, message: "O nome do animal é obrigatório." };
  }
  if (!row.disponibilidade) {
    return { ok: false, message: "A disponibilidade é obrigatória." };
  }

  const valoresDisp = DISPONIBILIDADE.map((d) => d.value);
  if (!valoresDisp.includes(row.disponibilidade)) {
    return { ok: false, message: "Selecione uma disponibilidade válida." };
  }

  if (row.sexo != null && row.sexo !== "" && !SEXO_VALUES.includes(/** @type {*} */ (row.sexo))) {
    return { ok: false, message: "Sexo inválido." };
  }
  if (row.porte != null && row.porte !== "" && !PORTE_VALUES.includes(/** @type {*} */ (row.porte))) {
    return { ok: false, message: "Porte inválido." };
  }

  return { ok: true };
}
