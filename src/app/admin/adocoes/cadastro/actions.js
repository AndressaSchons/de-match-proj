"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { resolveFormData } from "@/lib/resolve-form-data";

function normalizeDbErrorMessage(error) {
  const msg = String(error?.message ?? "");
  const code = String(error?.code ?? "");

  if (code === "23505" || /duplicate key|unique constraint/i.test(msg)) {
    return "Este animal já possui uma adoção cadastrada.";
  }

  return msg || "Erro inesperado.";
}

async function requireAdminSession(supabase) {
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

  if (perfilRow?.perfil_acesso !== "administrador") {
    return { ok: false, message: "Apenas administradores podem cadastrar adoções.", user: null };
  }

  return { ok: true, message: "", user };
}

function revalidateAdocaoPaths(idAnimal) {
  revalidatePath("/");
  revalidatePath("/animais");
  revalidatePath("/admin/adocoes/cadastro");
  if (idAnimal != null) {
    revalidatePath(`/animais/${idAnimal}`);
    revalidatePath(`/animais/${idAnimal}/editar`);
  }
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

  const anexoUrl = String(formData.get("termo_adocao_anexo_url") ?? "").trim();

  if (anexoUrl && !/^https?:\/\//i.test(anexoUrl)) {
    return { ok: false, message: "Anexo inválido. Reenvie o arquivo." };
  }

  if (!anexoUrl) {
    return { ok: false, message: "Anexe o termo de adoção (PDF ou imagem)." };
  }

  const termo_adocao = anexoUrl;

  const supabase = await createClient();
  const admin = await requireAdminSession(supabase);
  if (!admin.ok) return { ok: false, message: admin.message };

  const { error: insertError } = await supabase.from("adocao").insert({
    id_animal: idNum,
    id_usuario: admin.user.id,
    termo_adocao,
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
  return { ok: true, message: "Adoção cadastrada e animal marcado como adotado." };
}

