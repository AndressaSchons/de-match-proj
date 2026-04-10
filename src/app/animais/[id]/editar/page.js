import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { podeCadastrarAnimal } from "@/lib/animal-constants";
import { isAdministrador } from "@/lib/permissions";
import { animalRowToFormDefaults } from "../../animal-map";
import { EditarAnimalForm } from "./editar-animal-form";

export const metadata = {
  title: "Editar animal",
};

export default async function EditarAnimalPage({ params }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/animais/${idNum}/editar`)}`);

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (!podeCadastrarAnimal(perfil?.perfil_acesso)) {
    redirect(`/animais/${idNum}`);
  }

  const { data: animal, error } = await supabase.from("animal").select("*").eq("id_animal", idNum).maybeSingle();

  if (error || !animal) notFound();

  const defaultValues = animalRowToFormDefaults(animal);

  return (
    <EditarAnimalForm
      idAnimal={idNum}
      defaultValues={defaultValues}
      isAdmin={isAdministrador(perfil?.perfil_acesso)}
      podeAnimal
    />
  );
}
