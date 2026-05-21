import { describe, expect, it } from "vitest";
import { animalRowFromFormData, validateAnimalRow } from "./animal-form-parse.js";

function form(entries) {
  const fd = new FormData();
  for (const [k, v] of entries) fd.set(k, v);
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
    const row = { nome_animal: "Thor", disponibilidade: "disponivel", sexo: null, porte: null };
    expect(validateAnimalRow(row).ok).toBe(true);
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
});
