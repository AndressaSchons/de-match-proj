"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isUserType } from "@/lib/user-types";

export async function createUserAccount(_prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const { data: perfilRow } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (perfilRow?.perfil_acesso !== "administrador") {
    return { ok: false, message: "Apenas administradores podem criar contas por aqui." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nome_completo = String(formData.get("nome_completo") ?? "").trim();
  const perfil_acesso = String(formData.get("perfil_acesso") ?? "").trim();

  if (!email) {
    return { ok: false, message: "Informe o e-mail." };
  }
  if (password.length < 6) {
    return { ok: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (!nome_completo) {
    return { ok: false, message: "Informe o nome da pessoa." };
  }
  if (!isUserType(perfil_acesso)) {
    return { ok: false, message: "Tipo de acesso inválido." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Configuração do servidor incompleta." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome_completo, perfil_acesso },
  });

  if (createError) {
    return { ok: false, message: createError.message };
  }

  const newId = created?.user?.id;
  if (!newId) {
    return { ok: false, message: "Resposta inesperada ao criar usuário." };
  }

  const { error: profileError } = await admin.from("perfil").upsert(
    {
      id: newId,
      nome_completo,
      perfil_acesso,
      data_atualizacao: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return { ok: false, message: `Usuário criado no Auth, mas falhou ao salvar perfil: ${profileError.message}` };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Conta criada: ${email}. O usuário já pode entrar com essa senha.` };
}
