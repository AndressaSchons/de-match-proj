"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DISPONIBILIDADE, podeCadastrarAnimal } from "@/lib/animal-constants";

function strOrNull(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function cadastrarAnimal(_prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    return {
      ok: false,
      message: "Seu perfil não pode cadastrar animais. Fale com um administrador.",
    };
  }

  // Campos obrigatórios (include Validar Campos Obrigatórios do diagrama)
  const nome_animal = String(formData.get("nome_animal") ?? "").trim();
  const disponibilidade = String(formData.get("disponibilidade") ?? "").trim();

  if (!nome_animal) {
    return { ok: false, message: "O nome do animal é obrigatório." };
  }
  if (!disponibilidade) {
    return { ok: false, message: "A disponibilidade é obrigatória." };
  }

  const valoresDisp = DISPONIBILIDADE.map((d) => d.value);
  if (!valoresDisp.includes(disponibilidade)) {
    return { ok: false, message: "Selecione uma disponibilidade válida." };
  }

  const castrado = formData.get("castrado") === "on" || formData.get("castrado") === "true";

  const row = {
    nome_animal,
    disponibilidade,
    raca: strOrNull(formData.get("raca")),
    foto: strOrNull(formData.get("foto")),
    descricao_historia: strOrNull(formData.get("descricao_historia")),
    castrado,
    vacinacao: strOrNull(formData.get("vacinacao")),
    localizacao: strOrNull(formData.get("localizacao")),
    observacoes: strOrNull(formData.get("observacoes")),
  };

  const { error } = await supabase.from("animal").insert(row);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/animais/cadastro");
  return { ok: true, message: "Animal cadastrado com sucesso." };
}
