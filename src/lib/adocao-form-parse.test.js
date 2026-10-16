import { describe, expect, it } from "vitest";
import { caminhoTermoNoStorage, parseAdocaoCampos } from "./adocao-form-parse.js";

const HOJE = "2026-10-15";
const TERMO = "https://exemplo.supabase.co/storage/v1/object/public/adocao-termos/t.pdf";

function form(entries) {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
}

describe("parseAdocaoCampos", () => {
  it("exige a data da adoção", () => {
    const r = parseAdocaoCampos(form([]), { hoje: HOJE });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/data/i);
  });

  it("rejeita data no futuro", () => {
    const r = parseAdocaoCampos(form([["data_adocao", "2026-10-16"]]), { hoje: HOJE });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/futuro/i);
  });

  it("aceita sem termo quando o termo é opcional", () => {
    const r = parseAdocaoCampos(form([["data_adocao", HOJE]]), { hoje: HOJE });
    expect(r).toEqual({ ok: true, data_adocao: HOJE, termo_adocao: null });
  });

  it("exige o termo quando configurado como obrigatório", () => {
    const r = parseAdocaoCampos(form([["data_adocao", HOJE]]), { hoje: HOJE, termoObrigatorio: true });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/termo/i);
  });

  it("aceita termo com URL http(s)", () => {
    const r = parseAdocaoCampos(
      form([["data_adocao", HOJE], ["termo_adocao_anexo_url", TERMO]]),
      { hoje: HOJE, termoObrigatorio: true }
    );
    expect(r).toEqual({ ok: true, data_adocao: HOJE, termo_adocao: TERMO });
  });

  it("rejeita anexo que não é URL", () => {
    const r = parseAdocaoCampos(
      form([["data_adocao", HOJE], ["termo_adocao_anexo_url", "arquivo.pdf"]]),
      { hoje: HOJE }
    );
    expect(r.ok).toBe(false);
  });
});

describe("caminhoTermoNoStorage", () => {
  it("extrai o caminho do arquivo da URL pública", () => {
    expect(caminhoTermoNoStorage(TERMO)).toBe("t.pdf");
    expect(
      caminhoTermoNoStorage(
        "https://x.supabase.co/storage/v1/object/public/adocao-termos/adocoes/u1/a%20b.pdf?t=1"
      )
    ).toBe("adocoes/u1/a b.pdf");
  });

  it("devolve null para URL de outro lugar", () => {
    expect(caminhoTermoNoStorage("https://exemplo.com/termo.pdf")).toBeNull();
    expect(caminhoTermoNoStorage(null)).toBeNull();
  });
});
