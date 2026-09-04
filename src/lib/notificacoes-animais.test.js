import { describe, expect, it } from "vitest";
import {
  buildNotificacoesIncompletos,
  buildNotificacoesNovosAnimais,
  isAnimalCadastroIncompleto,
} from "./notificacoes-animais.js";

const animalCompleto = {
  foto: "https://exemplo/foto.jpg",
  sexo: "macho",
  porte: "medio",
  data_nascimento: "2020-01-15",
  raca: "SRD",
  descricao_historia: "História",
  vacinacao: "V8",
  localizacao: "Porto Alegre",
};

describe("isAnimalCadastroIncompleto", () => {
  it("retorna false quando todos os campos esperados estão preenchidos", () => {
    expect(isAnimalCadastroIncompleto(animalCompleto)).toBe(false);
  });

  it("retorna true quando falta pelo menos um campo", () => {
    expect(isAnimalCadastroIncompleto({ ...animalCompleto, foto: null })).toBe(true);
    expect(isAnimalCadastroIncompleto({ ...animalCompleto, localizacao: "" })).toBe(true);
  });

  it("ignora vacinação: cadastro sem esse campo não é considerado incompleto", () => {
    expect(isAnimalCadastroIncompleto({ ...animalCompleto, vacinacao: "" })).toBe(false);
    expect(isAnimalCadastroIncompleto({ ...animalCompleto, vacinacao: null })).toBe(false);
  });
});

describe("buildNotificacoesNovosAnimais", () => {
  it("monta mensagem e link da ficha do animal", () => {
    const [n] = buildNotificacoesNovosAnimais([
      { id_animal: 7, nome_animal: "Rex" },
    ]);
    expect(n.tipo).toBe("animal");
    expect(n.mensagem).toBe("Novo: Rex");
    expect(n.href).toBe("/animais/7");
  });
});

describe("buildNotificacoesIncompletos", () => {
  it("monta alerta com link para edição", () => {
    const [n] = buildNotificacoesIncompletos([
      { id_animal: 3, nome_animal: "Luna" },
    ]);
    expect(n.tipo).toBe("alerta");
    expect(n.mensagem).toBe("Incompleto: Luna");
    expect(n.href).toBe("/animais/3/editar");
  });
});
