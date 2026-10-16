"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { animalRowFromFormData, validateAnimalRow } from "@/lib/animal-form-parse";
import { resolveFormData } from "@/lib/resolve-form-data";
import { podeCadastrarAnimal, podeExcluirAnimal } from "@/lib/animal-constants";
import { podeCadastrarAdocao } from "@/lib/permissions";
import { BUCKET_TERMOS, caminhoTermoNoStorage, parseAdocaoCampos } from "@/lib/adocao-form-parse";
import { carregarConfiguracaoSistema } from "@/lib/configuracao-sistema";

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

/**
 * Animal salvo como "adotado" por administrador/validador: lê a seção "Adoção" do formulário.
 * `campos` é null quando não há adoção a registrar (outra situação ou perfil sem permissão).
 */
async function lerAdocaoDoFormulario(supabase, perfilAcesso, row, formData) {
  if (row.disponibilidade !== "adotado" || !podeCadastrarAdocao(perfilAcesso)) {
    return { ok: true, campos: null };
  }
  const { termo_obrigatorio } = await carregarConfiguracaoSistema(supabase);
  const campos = parseAdocaoCampos(formData, { termoObrigatorio: termo_obrigatorio });
  if (!campos.ok) return campos;
  return { ok: true, campos };
}

/**
 * Cria ou atualiza a adoção do animal. Sem novo anexo, mantém o termo já gravado.
 * @returns {Promise<string | null>} mensagem de erro, ou null em caso de sucesso
 */
async function salvarAdocaoDoAnimal(supabase, idUsuario, idAnimal, campos) {
  const { data: existente, error: selectError } = await supabase
    .from("adocao")
    .select("id_operacao, termo_adocao")
    .eq("id_animal", idAnimal)
    .maybeSingle();
  if (selectError) return selectError.message;

  if (existente) {
    const { error } = await supabase
      .from("adocao")
      .update({
        data_adocao: campos.data_adocao,
        termo_adocao: campos.termo_adocao ?? existente.termo_adocao,
      })
      .eq("id_operacao", existente.id_operacao);
    if (error) return error.message;
    // Termo substituído por um novo arquivo: apaga o antigo do Storage.
    if (campos.termo_adocao && existente.termo_adocao && campos.termo_adocao !== existente.termo_adocao) {
      await removerArquivoTermo(supabase, existente.termo_adocao);
    }
    return null;
  }

  const { error } = await supabase.from("adocao").insert({
    id_animal: idAnimal,
    id_usuario: idUsuario,
    data_adocao: campos.data_adocao,
    termo_adocao: campos.termo_adocao,
  });
  return error?.message ?? null;
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

  const adocao = await lerAdocaoDoFormulario(supabase, perfil?.perfil_acesso, row, formData);
  if (!adocao.ok) return adocao;

  const insertPayload = {
    nome_animal: row.nome_animal,
    disponibilidade: row.disponibilidade,
    raca: row.raca,
    foto: row.foto,
    fotos: row.fotos,
    descricao_historia: row.descricao_historia,
    castrado: row.castrado,
    vacinacao: row.vacinacao,
    localizacao: row.localizacao,
    observacoes: row.observacoes,
    sexo: row.sexo,
    porte: row.porte,
    data_nascimento: row.data_nascimento,
  };

  const { data: criado, error } = await supabase
    .from("animal")
    .insert(insertPayload)
    .select("id_animal")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (adocao.campos) {
    const erroAdocao = await salvarAdocaoDoAnimal(supabase, user.id, criado.id_animal, adocao.campos);
    if (erroAdocao) {
      revalidateAnimalPaths(criado.id_animal);
      return {
        ok: false,
        message: `O animal foi cadastrado, mas a adoção não foi registrada: ${erroAdocao}. Edite o animal para tentar de novo.`,
      };
    }
  }

  revalidateAnimalPaths(criado.id_animal);
  return {
    ok: true,
    message:
      adocao.campos && !adocao.campos.termo_adocao
        ? "Animal cadastrado com sucesso. Aguardando termo de adoção."
        : "Animal cadastrado com sucesso.",
  };
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

  const adocao = await lerAdocaoDoFormulario(supabase, perfil?.perfil_acesso, row, formData);
  if (!adocao.ok) return adocao;

  const updatePayload = {
    nome_animal: row.nome_animal,
    disponibilidade: row.disponibilidade,
    raca: row.raca,
    foto: row.foto,
    fotos: row.fotos,
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

  if (adocao.campos) {
    const erroAdocao = await salvarAdocaoDoAnimal(supabase, user.id, idNum, adocao.campos);
    if (erroAdocao) {
      revalidateAnimalPaths(idNum);
      return {
        ok: false,
        message: `Os dados do animal foram salvos, mas a adoção não foi registrada: ${erroAdocao}`,
      };
    }
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

  // Guarda o termo antes: a adoção é apagada junto com o animal (ON DELETE CASCADE).
  const { data: adocao } = await supabase
    .from("adocao")
    .select("termo_adocao")
    .eq("id_animal", idNum)
    .maybeSingle();

  const { error } = await supabase.from("animal").delete().eq("id_animal", idNum);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Este animal tem uma adoção registrada. Rode o script adocao_exclusao_cascata.sql no Supabase para permitir a exclusão.",
      };
    }
    return { ok: false, message: error.message };
  }

  await removerArquivoTermo(supabase, adocao?.termo_adocao);

  revalidateAnimalPaths(idNum);
  redirect("/animais");
}

/** Apaga o arquivo do termo no Storage. Falha aqui não desfaz a operação no banco. */
async function removerArquivoTermo(supabase, url) {
  const caminho = caminhoTermoNoStorage(url);
  if (!caminho) return;
  await supabase.storage.from(BUCKET_TERMOS).remove([caminho]);
}

/** Exclui o termo de uma adoção; ela volta a ficar "Aguardando termo de adoção". */
export async function excluirTermoAdocao(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Animal inválido." };
  }

  const { supabase, user, perfil } = await getPerfilEquipe();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }
  if (!podeCadastrarAdocao(perfil?.perfil_acesso)) {
    return { ok: false, message: "Seu perfil não pode alterar adoções." };
  }

  const { data: adocao, error: selectError } = await supabase
    .from("adocao")
    .select("id_operacao, termo_adocao")
    .eq("id_animal", idNum)
    .maybeSingle();

  if (selectError) {
    return { ok: false, message: selectError.message };
  }
  if (!adocao?.termo_adocao) {
    return { ok: false, message: "Esta adoção não possui termo." };
  }

  const { error } = await supabase
    .from("adocao")
    .update({ termo_adocao: null })
    .eq("id_operacao", adocao.id_operacao);

  if (error) {
    return { ok: false, message: error.message };
  }

  await removerArquivoTermo(supabase, adocao.termo_adocao);

  revalidateAnimalPaths(idNum);
  return { ok: true, message: "Termo de adoção excluído." };
}

/** Anexa o termo a uma adoção já cadastrada que está "Aguardando termo de adoção". */
export async function anexarTermoAdocao(prevOrFormData, maybeFormData) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  if (!formData) {
    return { ok: false, message: "Requisição inválida." };
  }

  const idRaw = String(formData.get("id_animal") ?? "").trim();
  const idNum = Number(idRaw);
  if (!idRaw || !Number.isFinite(idNum) || idNum <= 0) {
    return { ok: false, message: "Animal inválido." };
  }

  const anexoUrl = String(formData.get("termo_adocao_anexo_url") ?? "").trim();
  if (!anexoUrl) {
    return { ok: false, message: "Anexe o termo de adoção (PDF ou imagem)." };
  }
  if (!/^https?:\/\//i.test(anexoUrl)) {
    return { ok: false, message: "Anexo inválido. Reenvie o arquivo." };
  }

  const { supabase, user, perfil } = await getPerfilEquipe();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }
  if (!podeCadastrarAdocao(perfil?.perfil_acesso)) {
    return { ok: false, message: "Seu perfil não pode registrar adoções." };
  }

  // Só preenche adoções ainda sem termo (não sobrescreve um termo existente).
  const { data: atualizadas, error } = await supabase
    .from("adocao")
    .update({ termo_adocao: anexoUrl })
    .eq("id_animal", idNum)
    .is("termo_adocao", null)
    .select("id_operacao");

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!atualizadas?.length) {
    return { ok: false, message: "Esta adoção já possui termo ou não foi encontrada." };
  }

  revalidateAnimalPaths(idNum);
  return { ok: true, message: "Termo de adoção anexado." };
}
