import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import PerfilUsuario from "./perfil-usuario";

export const metadata = {
  title: "Perfil User",
};

export default async function PerfilUsuarioPage({ params, searchParams }) {
  const { id }  = await params;
  const { modo } = await searchParams; // ?modo=editar
  const editar  = modo === "editar";

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfil")
    .select("id, nome_completo, perfil_acesso")
    .eq("id", id)
    .maybeSingle();

  if (!perfil) notFound();

  let email = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(id);
    email = data?.user?.email ?? null;
  } catch {
    // sem SUPABASE_SERVICE_ROLE_KEY
  }

  return (
    <PerfilUsuario
      id={perfil.id}
      nome={perfil.nome_completo}
      email={email}
      perfilAcesso={perfil.perfil_acesso}
      editar={editar}
    />
  );
}
