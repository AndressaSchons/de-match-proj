import { describe, expect, it } from "vitest";
import { MAX_FOTOS, animalRowFromFormData, validateAnimalRow } from "./animal-form-parse.js";

function form(entries) {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
}

describe("validateAnimalRow", () => {
  it("rejeita cadastro sem nome", () => {
    const row = { nome_animal: "", disponibilidade: "disponivel" };
    const r = validateAnimalRow(row);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/nome/i);
  });

  it("aceita cadastro mínimo válido", () => {
    const row = { nome_animal: "Thor", disponibilidade: "disponivel", sexo: "macho", porte: "medio", raca: "Caramelo" };
    expect(validateAnimalRow(row).ok).toBe(true);
  });

  it.each([
    ["sexo", /sexo/i],
    ["porte", /porte/i],
    ["raca", /raça/i],
  ])("exige %s", (campo, mensagem) => {
    const row = { nome_animal: "Thor", disponibilidade: "disponivel", sexo: "macho", porte: "medio", raca: "Caramelo" };
    const r = validateAnimalRow({ ...row, [campo]: null });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(mensagem);
  });

  it("rejeita disponibilidade inválida", () => {
    const row = { nome_animal: "Thor", disponibilidade: "invalido" };
    const r = validateAnimalRow(row);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/disponibilidade/i);
  });
});

describe("animalRowFromFormData", () => {
  it("converte vacinação vazia para null", () => {
    const row = animalRowFromFormData(
      form([
        ["nome_animal", "Mia"],
        ["disponibilidade", "disponivel"],
        ["castrado", "nao"],
        ["vacinacao", "  "],
      ])
    );
    expect(row.vacinacao).toBeNull();
    expect(row.nome_animal).toBe("Mia");
  });

  it("junta várias fotos e usa a primeira como capa", () => {
    const row = animalRowFromFormData(
      form([
        ["nome_animal", "Mia"],
        ["disponibilidade", "disponivel"],
        ["fotos", "https://exemplo/1.jpg"],
        ["fotos", "https://exemplo/2.jpg"],
        ["fotos", "https://exemplo/3.jpg"],
      ])
    );
    expect(row.fotos).toEqual([
      "https://exemplo/1.jpg",
      "https://exemplo/2.jpg",
      "https://exemplo/3.jpg",
    ]);
    expect(row.foto).toBe("https://exemplo/1.jpg");
  });

  it("descarta fotos vazias e repetidas", () => {
    const row = animalRowFromFormData(
      form([
        ["nome_animal", "Mia"],
        ["disponibilidade", "disponivel"],
        ["fotos", "  "],
        ["fotos", "https://exemplo/1.jpg"],
        ["fotos", "https://exemplo/1.jpg"],
      ])
    );
    expect(row.fotos).toEqual(["https://exemplo/1.jpg"]);
  });

  it("respeita o limite de fotos", () => {
    const entries = [
      ["nome_animal", "Mia"],
      ["disponibilidade", "disponivel"],
    ];
    for (let i = 0; i < MAX_FOTOS + 3; i += 1) {
      entries.push(["fotos", `https://exemplo/${i}.jpg`]);
    }
    expect(animalRowFromFormData(form(entries)).fotos).toHaveLength(MAX_FOTOS);
  });

  it("sem foto nenhuma, capa fica nula e galeria vazia", () => {
    const row = animalRowFromFormData(
      form([
        ["nome_animal", "Mia"],
        ["disponibilidade", "disponivel"],
      ])
    );
    expect(row.foto).toBeNull();
    expect(row.fotos).toEqual([]);
  });
});
