"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isUserType } from "@/lib/user-types";

/* ─── guard: só admin executa ───────────────────────────── */
async function getAdminOrThrow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Sessão expirada. Entre novamente.");

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.perfil_acesso !== "administrador") {
    throw new Error("Apenas administradores podem realizar esta ação.");
  }

  return { supabase, user };
}

/* ═══════════════════════════════════════════════════════════
   Busca todos os usuários (perfil + email do auth)
   Usado pelo page.js via import direto — não é Server Action
══════════════════════════════════════════════════════════ */
export async function listarUsuarios() {
  const supabase = await createClient();

  const { data: perfis, error } = await supabase
    .from("perfil")
    .select("id, nome_completo, perfil_acesso, data_atualizacao")
    .order("nome_completo", { ascending: true });

  if (error) return { ok: false, usuarios: [], message: error.message };

  // enriquece com email via admin client
  let emailMap = {};
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    emailMap = Object.fromEntries(
      (data?.users ?? []).map((u) => [u.id, u.email])
    );
  } catch {
    // sem SUPABASE_SERVICE_ROLE_KEY — emails omitidos
  }

  const usuarios = (perfis ?? []).map((p) => ({
    id:              p.id,
    nome:            p.nome_completo,
    email:           emailMap[p.id] ?? null,
    perfil_acesso:   p.perfil_acesso,
    data_atualizacao: p.data_atualizacao,
  }));

  return { ok: true, usuarios };
}

/* ═══════════════════════════════════════════════════════════
   Atualiza perfil de acesso de um usuário
══════════════════════════════════════════════════════════ */
export async function atualizarPerfilAcesso(_prevState, formData) {
  try {
    await getAdminOrThrow();
  } catch (e) {
    return { ok: false, message: e.message };
  }

  const id            = String(formData.get("id") ?? "").trim();
  const perfil_acesso = String(formData.get("perfil_acesso") ?? "").trim();

  if (!id) return { ok: false, message: "ID do usuário não informado." };
  if (!isUserType(perfil_acesso)) return { ok: false, message: "Perfil de acesso inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfil")
    .update({ perfil_acesso, data_atualizacao: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/usuarios/gerenciar");
  return { ok: true, message: "Perfil atualizado com sucesso." };
}

/* ═══════════════════════════════════════════════════════════
   Atualiza nome completo de um usuário
══════════════════════════════════════════════════════════ */
export async function atualizarNome(_prevState, formData) {
  try {
    await getAdminOrThrow();
  } catch (e) {
    return { ok: false, message: e.message };
  }

  const id            = String(formData.get("id") ?? "").trim();
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();

  if (!id)            return { ok: false, message: "ID do usuário não informado." };
  if (!nome_completo) return { ok: false, message: "Nome não pode ser vazio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfil")
    .update({ nome_completo, data_atualizacao: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/usuarios/gerenciar");
  return { ok: true, message: "Nome atualizado com sucesso." };
}

/* ═══════════════════════════════════════════════════════════
   Deleta usuário do auth (cascade apaga o perfil)
══════════════════════════════════════════════════════════ */
export async function deletarUsuario(_prevState, formData) {
  try {
    await getAdminOrThrow();
  } catch (e) {
    return { ok: false, message: e.message };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "ID do usuário não informado." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Configuração incompleta." };
  }

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/usuarios/gerenciar");
  return { ok: true, message: "Usuário removido com sucesso." };
}

/* ═══════════════════════════════════════════════════════════
   Redefine senha de um usuário
══════════════════════════════════════════════════════════ */
export async function redefinirSenha(_prevState, formData) {
  try {
    await getAdminOrThrow();
  } catch (e) {
    return { ok: false, message: e.message };
  }

  const id       = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!id)               return { ok: false, message: "ID do usuário não informado." };
  if (password.length < 6) return { ok: false, message: "A senha deve ter pelo menos 6 caracteres." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Configuração incompleta." };
  }

  const { error } = await admin.auth.admin.updateUserById(id, { password });

  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Senha redefinida com sucesso." };
}
