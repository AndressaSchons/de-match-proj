/** Perfis que podem cadastrar/editar animal (caso de uso: voluntário; + validador e admin). */
export const PERFIS_CADASTRO_ANIMAL = /** @type {const} */ ([
  "voluntario",
  "validador",
  "administrador",
]);

/** Disponibilidade do animal (valor gravado no banco). */
export const DISPONIBILIDADE = /** @type {const} */ ([
  { value: "disponivel", label: "Disponível para adoção" },
  { value: "em_processo", label: "Em processo de adoção" },
  { value: "indisponivel", label: "Indisponível no momento" },
]);

export function podeCadastrarAnimal(perfilAcesso) {
  return PERFIS_CADASTRO_ANIMAL.includes(perfilAcesso ?? "");
}
