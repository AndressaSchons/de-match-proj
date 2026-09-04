import { describe, expect, it } from "vitest";
import { podeCadastrarAnimal, podeExcluirAnimal } from "./animal-constants.js";
import { isAdministrador, podeCadastrarAdocao, podeVerMetricasAdocao } from "./permissions.js";

describe("permissões da equipe", () => {
  it("voluntário pode cadastrar animal", () => {
    expect(podeCadastrarAnimal("voluntario")).toBe(true);
  });

  it("perfil inválido não cadastra animal", () => {
    expect(podeCadastrarAnimal(null)).toBe(false);
    expect(podeCadastrarAnimal("visitante")).toBe(false);
  });

  it("só administrador pode excluir animal", () => {
    expect(podeExcluirAnimal("administrador")).toBe(true);
    expect(podeExcluirAnimal("validador")).toBe(false);
    expect(podeExcluirAnimal("voluntario")).toBe(false);
  });

  it("métricas visíveis para admin e validador", () => {
    expect(podeVerMetricasAdocao("administrador")).toBe(true);
    expect(podeVerMetricasAdocao("validador")).toBe(true);
    expect(podeVerMetricasAdocao("voluntario")).toBe(false);
    expect(isAdministrador("administrador")).toBe(true);
    expect(isAdministrador("validador")).toBe(false);
  });

  it("adoção pode ser cadastrada por admin e validador, não por voluntário", () => {
    expect(podeCadastrarAdocao("administrador")).toBe(true);
    expect(podeCadastrarAdocao("validador")).toBe(true);
    expect(podeCadastrarAdocao("voluntario")).toBe(false);
    expect(podeCadastrarAdocao(null)).toBe(false);
  });
});
