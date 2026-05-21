import {
  podeCadastrarAnimal,
  podeExcluirAnimal,
} from "@/lib/animal-constants";

export { podeCadastrarAnimal, podeExcluirAnimal };

/** @param {string | null | undefined} perfilAcesso */
export function isAdministrador(perfilAcesso) {
  return perfilAcesso === "administrador";
}

/** Métricas de adoção na home: administrador e validador (RLS já cobre SELECT completo). */
export function podeVerMetricasAdocao(perfilAcesso) {
  return perfilAcesso === "administrador" || perfilAcesso === "validador";
}
