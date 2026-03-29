"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isUserType } from "@/lib/user-types";

export async function updateContaProfile(_prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const perfil_raw = String(formData.get("perfil_acesso") ?? "").trim();

  const { data: row, error: fetchError } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  const payload = {
    nome_completo,
    data_atualizacao: new Date().toISOString(),
  };

  const isAdmin = row?.perfil_acesso === "administrador";
  if (isAdmin && isUserType(perfil_raw)) {
    payload.perfil_acesso = perfil_raw;
  }

  if (!row) {
    const { error: insertError } = await supabase.from("perfil").insert({
      id: user.id,
      nome_completo,
      perfil_acesso: "voluntario",
    });

    if (insertError) {
      return { ok: false, message: insertError.message };
    }

    revalidatePath("/conta");
    return { ok: true, message: "Perfil criado e salvo." };
  }

  const { error: updateError } = await supabase.from("perfil").update(payload).eq("id", user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  revalidatePath("/conta");
  return { ok: true, message: "Dados da conta atualizados." };
}

export async function updateContaPassword(_prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const newPassword = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 6) {
    return { ok: false, message: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  if (newPassword !== confirm) {
    return { ok: false, message: "As senhas não coincidem." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/conta");
  return { ok: true, message: "Senha atualizada." };
}
