"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminDatabase, countAdministradores } from "@/lib/auth/admin-service";
import { resolveFormData } from "@/lib/resolve-form-data";
import { isUserType } from "@/lib/user-types";

function errMessage(e) {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

export async function atualizarUsuario(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const perfil_acesso = String(formData.get("perfil_acesso") ?? "").trim();

  if (!id) return { ok: false, message: "ID não informado." };
  if (!nome_completo) return { ok: false, message: "Nome não pode ser vazio." };
  if (!isUserType(perfil_acesso)) return { ok: false, message: "Perfil de acesso inválido." };

  try {
    const { db } = await getAdminDatabase();

    const { data: alvo } = await db.from("perfil").select("perfil_acesso").eq("id", id).maybeSingle();
    if (!alvo) return { ok: false, message: "Usuário não encontrado." };

    if (alvo.perfil_acesso === "administrador" && perfil_acesso !== "administrador") {
      const n = await countAdministradores(db);
      if (n <= 1) {
        return { ok: false, message: "Não é possível remover o único administrador do sistema." };
      }
    }

    const { error } = await db
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
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }

  redirect(`/admin/usuarios/${id}`);
}
