"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { resolveFormData } from "@/lib/resolve-form-data";
import { podeCadastrarAdocao } from "@/lib/permissions";

function normalizeDbErrorMessage(error) {
  const msg = String(error?.message ?? "");
  const code = String(error?.code ?? "");

  if (code === "23505" || /duplicate key|unique constraint/i.test(msg)) {
    return "Este animal já possui uma adoção cadastrada.";
  }

  return msg || "Erro inesperado.";
}

async function requireAdocaoSession(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente.", user: null };
  }

  const { data: perfilRow } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (!podeCadastrarAdocao(perfilRow?.perfil_acesso)) {
    return { ok: false, message: "Seu perfil não pode cadastrar adoções.", user: null };
  }

  return { ok: true, message: "", user };
}

function revalidateAdocaoPaths(idAnimal) {
  revalidatePath("/");
  revalidatePath("/animais");
  revalidatePath("/adocoes/cadastro");
  if (idAnimal != null) {
    revalidatePath(`/animais/${idAnimal}`);
    revalidatePath(`/animais/${idAnimal}/editar`);
  }
}

/** Anexa o termo a uma adoção já cadastrada que está "Aguardando termo de adoção". */
export async function anexarTermoAdocao(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Animal inválido." };
  }

  const anexoUrl = String(formData.get("termo_adocao_anexo_url") ?? "").trim();
  if (!anexoUrl) {
    return { ok: false, message: "Anexe o termo de adoção (PDF ou imagem)." };
  }
  if (!/^https?:\/\//i.test(anexoUrl)) {
    return { ok: false, message: "Anexo inválido. Reenvie o arquivo." };
  }

  const supabase = await createClient();
  const sessao = await requireAdocaoSession(supabase);
  if (!sessao.ok) return { ok: false, message: sessao.message };

  // Só preenche adoções ainda sem termo (não sobrescreve um termo existente).
  const { data: atualizadas, error: updateError } = await supabase
    .from("adocao")
    .update({ termo_adocao: anexoUrl })
    .eq("id_animal", idNum)
    .is("termo_adocao", null)
    .select("id_operacao");

  if (updateError) {
    return { ok: false, message: normalizeDbErrorMessage(updateError) };
  }
  if (!atualizadas?.length) {
    return { ok: false, message: "Esta adoção já possui termo ou não foi encontrada." };
  }

  revalidateAdocaoPaths(idNum);
  return { ok: true, message: "Termo de adoção anexado." };
}

export async function cadastrarAdocao(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Selecione um animal válido." };
  }

  const dataAdocaoRaw = String(formData.get("data_adocao") ?? "").trim();
  if (!dataAdocaoRaw || Number.isNaN(new Date(dataAdocaoRaw).getTime())) {
    return { ok: false, message: "Informe a data em que o animal foi adotado." };
  }
  const hoje = new Date().toISOString().slice(0, 10);
  if (dataAdocaoRaw > hoje) {
    return { ok: false, message: "A data da adoção não pode ser no futuro." };
  }

  const anexoUrl = String(formData.get("termo_adocao_anexo_url") ?? "").trim();

  if (anexoUrl && !/^https?:\/\//i.test(anexoUrl)) {
    return { ok: false, message: "Anexo inválido. Reenvie o arquivo." };
  }

  // Termo é opcional: sem anexo, a adoção fica "Aguardando termo de adoção".
  const termo_adocao = anexoUrl || null;

  const supabase = await createClient();
  const sessao = await requireAdocaoSession(supabase);
  if (!sessao.ok) return { ok: false, message: sessao.message };

  const { error: insertError } = await supabase.from("adocao").insert({
    id_animal: idNum,
    id_usuario: sessao.user.id,
    termo_adocao,
    data_adocao: dataAdocaoRaw,
  });

  if (insertError) {
    return { ok: false, message: normalizeDbErrorMessage(insertError) };
  }

  const { error: updateError } = await supabase
    .from("animal")
    .update({ disponibilidade: "adotado" })
    .eq("id_animal", idNum);

  if (updateError) {
    return {
      ok: false,
      message: `A adoção foi cadastrada, mas falhou ao atualizar o status do animal: ${normalizeDbErrorMessage(updateError)}`,
    };
  }

  revalidateAdocaoPaths(idNum);
  return {
    ok: true,
    message: termo_adocao
      ? "Adoção cadastrada e animal marcado como adotado."
      : "Adoção cadastrada e animal marcado como adotado. Aguardando termo de adoção.",
  };
}
