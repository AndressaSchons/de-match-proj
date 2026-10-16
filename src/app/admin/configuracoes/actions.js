"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { resolveFormData } from "@/lib/resolve-form-data";
import { isAdministrador } from "@/lib/permissions";

const NOME_ONG_MAX = 80;

export async function salvarConfiguracoes(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

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

  if (!isAdministrador(perfilRow?.perfil_acesso)) {
    return { ok: false, message: "Apenas administradores podem alterar as configurações." };
  }

  const { data: atualizadas, error } = await supabase
    .from("configuracao_sistema")
    .update({
      metricas_somente_com_termo: formData.get("metricas_somente_com_termo") === "on",
      termo_obrigatorio: formData.get("termo_obrigatorio") === "on",
      nome_ong: String(formData.get("nome_ong") ?? "").trim().slice(0, NOME_ONG_MAX),
      data_atualizacao: new Date().toISOString(),
      id_usuario_atualizacao: user.id,
    })
    .eq("id", 1)
    .select("id");

  if (error || !atualizadas?.length) {
    return {
      ok: false,
      message:
        "Não foi possível salvar. Confira se o script configuracao_sistema.sql foi rodado no Supabase." +
        (error?.message ? ` (${error.message})` : ""),
    };
  }

  // Layout raiz: o nome da ONG aparece na barra de navegação de todas as páginas.
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  revalidatePath("/animais/cadastro");
  return { ok: true, message: "Configurações salvas." };
}
