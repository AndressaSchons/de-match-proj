"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isUserType } from "@/lib/user-types";

export async function atualizarUsuario(_prevState, formData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão expirada. Entre novamente." };

  const id            = String(formData.get("id") ?? "").trim();
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const perfil_acesso = String(formData.get("perfil_acesso") ?? "").trim();

  if (!id)            return { ok: false, message: "ID não informado." };
  if (!nome_completo) return { ok: false, message: "Nome não pode ser vazio." };
  if (!isUserType(perfil_acesso)) return { ok: false, message: "Perfil de acesso inválido." };

  const { error } = await supabase
    .from("perfil")
    .update({
      nome_completo,
      perfil_acesso,
      data_atualizacao: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/usuarios/gerenciar");
  revalidatePath(`/admin/usuarios/${id}`);
  redirect(`/admin/usuarios/${id}`); // volta para o modo view
}
