/** Data de hoje (YYYY-MM-DD), usada como limite da data de adoção. */
export function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Lê e valida `data_adocao` e `termo_adocao_anexo_url` do FormData.
 * Sem termo (e não obrigatório), `termo_adocao` volta `null` → "Aguardando termo de adoção".
 * @param {FormData} formData
 * @param {{ termoObrigatorio?: boolean, hoje?: string }} [opts]
 * @returns {{ ok: false, message: string } | { ok: true, data_adocao: string, termo_adocao: string | null }}
 */
export function parseAdocaoCampos(formData, { termoObrigatorio = false, hoje = hojeIso() } = {}) {
  const dataAdocao = String(formData.get("data_adocao") ?? "").trim();
  if (!dataAdocao || Number.isNaN(new Date(dataAdocao).getTime())) {
    return { ok: false, message: "Informe a data em que o animal foi adotado." };
  }
  if (dataAdocao > hoje) {
    return { ok: false, message: "A data da adoção não pode ser no futuro." };
  }

  const anexoUrl = String(formData.get("termo_adocao_anexo_url") ?? "").trim();
  if (anexoUrl && !/^https?:\/\//i.test(anexoUrl)) {
    return { ok: false, message: "Anexo inválido. Reenvie o arquivo." };
  }
  if (!anexoUrl && termoObrigatorio) {
    return { ok: false, message: "Anexe o termo de adoção (PDF ou imagem)." };
  }

  return { ok: true, data_adocao: dataAdocao, termo_adocao: anexoUrl || null };
}

/** Bucket do Storage onde ficam os termos de adoção. */
export const BUCKET_TERMOS = "adocao-termos";

/**
 * Caminho do arquivo dentro do bucket, a partir da URL pública gravada em `adocao.termo_adocao`.
 * Ex.: ".../object/public/adocao-termos/adocoes/u1/a.pdf" → "adocoes/u1/a.pdf".
 * @param {string | null | undefined} url
 * @returns {string | null} null quando a URL não é de um arquivo do bucket
 */
export function caminhoTermoNoStorage(url) {
  const marcador = `/object/public/${BUCKET_TERMOS}/`;
  const s = String(url ?? "");
  const i = s.indexOf(marcador);
  if (i === -1) return null;
  const caminho = decodeURIComponent(s.slice(i + marcador.length).split(/[?#]/)[0]);
  return caminho || null;
}
