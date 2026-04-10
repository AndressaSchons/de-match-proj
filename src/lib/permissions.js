import {
  podeCadastrarAnimal,
  podeExcluirAnimal,
} from "@/lib/animal-constants";

export { podeCadastrarAnimal, podeExcluirAnimal };

/** @param {string | null | undefined} perfilAcesso */
export function isAdministrador(perfilAcesso) {
  return perfilAcesso === "administrador";
}
