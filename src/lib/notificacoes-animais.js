export const DIAS_NOVO_ANIMAL = 3;
export const LIMITE_NOVOS_ANIMAL = 5;
export const LIMITE_INCOMPLETOS = 5;
export const LOTE_BUSCA_INCOMPLETOS = 50;

const NOME_MAX_LEN = 24;

/** @param {unknown} value */
function campoVazio(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * @param {{
 *   foto?: string | null,
 *   sexo?: string | null,
 *   porte?: string | null,
 *   data_nascimento?: string | null,
 *   raca?: string | null,
 *   descricao_historia?: string | null,
 *   vacinacao?: string | null,
 *   localizacao?: string | null,
 * }} row
 */
export function isAnimalCadastroIncompleto(row) {
  return (
    campoVazio(row.foto) ||
    campoVazio(row.sexo) ||
    campoVazio(row.porte) ||
    campoVazio(row.data_nascimento) ||
    campoVazio(row.raca) ||
    campoVazio(row.descricao_historia) ||
    campoVazio(row.vacinacao) ||
    campoVazio(row.localizacao)
  );
}

/** @returns {string} ISO timestamp para filtro Supabase (agora − N dias). */
export function dataCadastroDesdeNovosAnimais(dias = DIAS_NOVO_ANIMAL) {
  const ms = Date.now() - dias * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

/** @param {string} nome */
function truncarNome(nome) {
  const t = String(nome ?? "").trim();
  if (t.length <= NOME_MAX_LEN) return t;
  return `${t.slice(0, NOME_MAX_LEN - 1)}…`;
}

/**
 * @param {Array<{ id_animal: number, nome_animal: string }>} animais
 * @returns {Array<{ id: number, tipo: "animal", mensagem: string, href: string }>}
 */
export function buildNotificacoesNovosAnimais(animais) {
  return (animais ?? []).map((a) => {
    const nome = truncarNome(a.nome_animal);
    return {
      id: a.id_animal,
      tipo: /** @type {const} */ ("animal"),
      mensagem: `Novo: ${nome}`,
      href: `/animais/${a.id_animal}`,
    };
  });
}

/**
 * @param {Array<{ id_animal: number, nome_animal: string }>} animais
 * @returns {Array<{ id: number, tipo: "alerta", mensagem: string, href: string }>}
 */
export function buildNotificacoesIncompletos(animais) {
  return (animais ?? []).map((a) => {
    const nome = truncarNome(a.nome_animal);
    return {
      id: a.id_animal,
      tipo: /** @type {const} */ ("alerta"),
      mensagem: `Incompleto: ${nome}`,
      href: `/animais/${a.id_animal}/editar`,
    };
  });
}
