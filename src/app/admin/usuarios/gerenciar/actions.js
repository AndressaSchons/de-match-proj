"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminDatabase, countAdministradores } from "@/lib/auth/admin-service";
import { resolveFormData } from "@/lib/resolve-form-data";
import { isUserType } from "@/lib/user-types";

function errMessage(e) {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

/* ═══════════════════════════════════════════════════════════
   Lista todos os usuários (perfil + e-mail do Auth)
   — precisa service role: RLS só permite SELECT do próprio perfil.
══════════════════════════════════════════════════════════ */
export async function listarUsuarios() {
  try {
    const { db } = await getAdminDatabase();

    const { data: perfis, error } = await db
      .from("perfil")
      .select("id, nome_completo, perfil_acesso, data_atualizacao")
      .order("nome_completo", { ascending: true });

    if (error) return { ok: false, usuarios: [], message: error.message };

    const { data: listData } = await db.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = Object.fromEntries((listData?.users ?? []).map((u) => [u.id, u.email]));

    const usuarios = (perfis ?? []).map((p) => ({
      id: p.id,
      nome: p.nome_completo,
      email: emailMap[p.id] ?? null,
      perfil_acesso: p.perfil_acesso,
      data_atualizacao: p.data_atualizacao,
    }));

    return { ok: true, usuarios };
  } catch (e) {
    return { ok: false, usuarios: [], message: errMessage(e) };
  }
}

/* ═══════════════════════════════════════════════════════════
   Atualiza perfil de acesso
══════════════════════════════════════════════════════════ */
export async function atualizarPerfilAcesso(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) return { ok: false, message: "Requisição inválida." };

  try {
    const { db } = await getAdminDatabase();
    const id = String(formData.get("id") ?? "").trim();
    const perfil_acesso = String(formData.get("perfil_acesso") ?? "").trim();

    if (!id) return { ok: false, message: "ID do usuário não informado." };
    if (!isUserType(perfil_acesso)) return { ok: false, message: "Perfil de acesso inválido." };

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
      .update({ perfil_acesso, data_atualizacao: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/usuarios/gerenciar");
    revalidatePath(`/admin/usuarios/${id}`);
    return { ok: true, message: "Perfil atualizado com sucesso." };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
}

/* ═══════════════════════════════════════════════════════════
   Atualiza nome completo
══════════════════════════════════════════════════════════ */
export async function atualizarNome(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) return { ok: false, message: "Requisição inválida." };

  try {
    const { db } = await getAdminDatabase();
    const id = String(formData.get("id") ?? "").trim();
    const nome_completo = String(formData.get("nome_completo") ?? "").trim();

    if (!id) return { ok: false, message: "ID do usuário não informado." };
    if (!nome_completo) return { ok: false, message: "Nome não pode ser vazio." };

    const { error } = await db
      .from("perfil")
      .update({ nome_completo, data_atualizacao: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/usuarios/gerenciar");
    revalidatePath(`/admin/usuarios/${id}`);
    return { ok: true, message: "Nome atualizado com sucesso." };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
}

/* ═══════════════════════════════════════════════════════════
   Remove usuário do Auth (perfil em cascade)
══════════════════════════════════════════════════════════ */
export async function deletarUsuario(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  let user;
  let db;
  try {
    ({ user, db } = await getAdminDatabase());
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "ID do usuário não informado." };

  if (id === user.id) {
    return { ok: false, message: "Você não pode excluir a própria conta por aqui." };
  }

  const { data: alvo } = await db.from("perfil").select("perfil_acesso").eq("id", id).maybeSingle();
  if (!alvo) return { ok: false, message: "Usuário não encontrado." };

  if (alvo.perfil_acesso === "administrador") {
    const n = await countAdministradores(db);
    if (n <= 1) {
      return { ok: false, message: "Não é possível excluir o único administrador do sistema." };
    }
  }

  const { error } = await db.auth.admin.deleteUser(id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/usuarios/gerenciar");
  redirect("/admin/usuarios/gerenciar");
}

/* ═══════════════════════════════════════════════════════════
   Redefine senha (Auth)
══════════════════════════════════════════════════════════ */
export async function redefinirSenha(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) return { ok: false, message: "Requisição inválida." };

  try {
    const { db } = await getAdminDatabase();
    const id = String(formData.get("id") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!id) return { ok: false, message: "ID do usuário não informado." };
    if (password.length < 6) return { ok: false, message: "A senha deve ter pelo menos 6 caracteres." };

    const { error } = await db.auth.admin.updateUserById(id, { password });
    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/usuarios/gerenciar");
    revalidatePath(`/admin/usuarios/${id}`);
    return { ok: true, message: "Senha redefinida com sucesso." };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
}
