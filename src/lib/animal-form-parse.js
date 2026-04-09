import {
  DISPONIBILIDADE,
  PORTE_VALUES,
  SEXO_VALUES,
} from "@/lib/animal-constants";

function strOrNull(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
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

  return {
    nome_animal,
    disponibilidade,
    sexo,
    porte,
    data_nascimento,
    raca: strOrNull(formData.get("raca")),
    foto: strOrNull(formData.get("foto")),
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
