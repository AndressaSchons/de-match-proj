export const DIAS_NOVO_ANIMAL = 3;
export const LIMITE_NOVOS_ANIMAL = 5;

const NOME_MAX_LEN = 24;

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
