import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal, podeExcluirAnimal } from "@/lib/animal-constants";
import { isAdministrador } from "@/lib/permissions";
import { AnimalDetailView } from "./animal-detail-view";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return { title: "Animal" };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from("animal").select("nome_animal").eq("id_animal", idNum).maybeSingle();

  return { title: row?.nome_animal ? `${row.nome_animal} – Animais` : `Animal #${id}` };
}

export default async function AnimalDetailPage({ params }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/animais/${idNum}`)}`);

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  const { data: animal, error } = await supabase.from("animal").select("*").eq("id_animal", idNum).maybeSingle();

  if (error || !animal) notFound();

  const perfilAcesso = perfil?.perfil_acesso ?? null;
  const isAdmin = isAdministrador(perfilAcesso);
  const isValidador = perfilAcesso === "validador";

  let termoAdocaoUrl = null;
  if (animal.disponibilidade === "adotado" && (isAdmin || isValidador)) {
    const { data: adocao } = await supabase
      .from("adocao")
      .select("termo_adocao")
      .eq("id_animal", idNum)
      .maybeSingle();
    termoAdocaoUrl = adocao?.termo_adocao ?? null;
  }

  return (
    <AnimalDetailView
      animal={animal}
      podeEditar={podeCadastrarAnimal(perfil?.perfil_acesso)}
      podeExcluir={podeExcluirAnimal(perfil?.perfil_acesso)}
      podeAnimal={podeCadastrarAnimal(perfil?.perfil_acesso)}
      isAdmin={isAdmin}
      termoAdocaoUrl={termoAdocaoUrl}
    />
  );
}
