"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { animalRowFromFormData, validateAnimalRow } from "@/lib/animal-form-parse";
import { resolveFormData } from "@/lib/resolve-form-data";
import { podeCadastrarAnimal, podeExcluirAnimal } from "@/lib/animal-constants";

function errMessage(e) {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

async function getPerfilEquipe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, perfil: null };

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, perfil };
}

function revalidateAnimalPaths(idAnimal) {
  revalidatePath("/");
  revalidatePath("/animais");
  revalidatePath("/animais/cadastro");
  if (idAnimal != null) {
    revalidatePath(`/animais/${idAnimal}`);
    revalidatePath(`/animais/${idAnimal}/editar`);
  }
}

export async function cadastrarAnimal(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const { supabase, user, perfil } = await getPerfilEquipe();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }
  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    return {
      ok: false,
      message: "Seu perfil não pode cadastrar animais. Fale com um administrador.",
    };
  }

  const row = animalRowFromFormData(formData);
  const v = validateAnimalRow(row);
  if (!v.ok) return v;

  const insertPayload = {
    nome_animal: row.nome_animal,
    disponibilidade: row.disponibilidade,
    raca: row.raca,
    foto: row.foto,
    descricao_historia: row.descricao_historia,
    castrado: row.castrado,
    vacinacao: row.vacinacao,
    localizacao: row.localizacao,
    observacoes: row.observacoes,
    sexo: row.sexo,
    porte: row.porte,
    data_nascimento: row.data_nascimento,
  };

  const { error } = await supabase.from("animal").insert(insertPayload);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAnimalPaths(null);
  return { ok: true, message: "Animal cadastrado com sucesso." };
}

export async function atualizarAnimal(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Identificador do animal inválido." };
  }

  const { supabase, user, perfil } = await getPerfilEquipe();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }
  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    return {
      ok: false,
      message: "Seu perfil não pode editar animais.",
    };
  }

  const row = animalRowFromFormData(formData);
  const v = validateAnimalRow(row);
  if (!v.ok) return v;

  const updatePayload = {
    nome_animal: row.nome_animal,
    disponibilidade: row.disponibilidade,
    raca: row.raca,
    foto: row.foto,
    descricao_historia: row.descricao_historia,
    castrado: row.castrado,
    vacinacao: row.vacinacao,
    localizacao: row.localizacao,
    observacoes: row.observacoes,
    sexo: row.sexo,
    porte: row.porte,
    data_nascimento: row.data_nascimento,
  };

  const { error } = await supabase.from("animal").update(updatePayload).eq("id_animal", idNum);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAnimalPaths(idNum);
  redirect(`/animais/${idNum}`);
}

export async function excluirAnimal(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Identificador do animal inválido." };
  }

  const { supabase, user, perfil } = await getPerfilEquipe();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }
  if (!podeExcluirAnimal(perfil?.perfil_acesso)) {
    return { ok: false, message: "Apenas administradores podem excluir animais." };
  }

  const { error } = await supabase.from("animal").delete().eq("id_animal", idNum);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAnimalPaths(idNum);
  redirect("/animais");
}
