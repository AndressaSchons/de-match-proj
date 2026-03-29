/** Valores do campo `perfil.perfil_acesso` no banco (use para permissões no app). */
export const USER_TYPES = /** @type {const} */ ([
  "administrador",
  "voluntario",
  "validador",
]);

/** @type {Record<(typeof USER_TYPES)[number], string>} */
export const USER_TYPE_LABELS = {
  administrador: "Administrador",
  voluntario: "Voluntário",
  validador: "Validador",
};

export function isUserType(value) {
  return USER_TYPES.includes(value);
}
