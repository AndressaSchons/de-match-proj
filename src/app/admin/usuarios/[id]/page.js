import { notFound, redirect } from "next/navigation";
import { getAdminDatabase } from "@/lib/auth/admin-service";
import PerfilUsuario from "./perfil-usuario";

export const metadata = {
  title: "Perfil User",
};

export default async function PerfilUsuarioPage({ params, searchParams }) {
  const { id } = await params;
  const { modo } = await searchParams;
  const editar = modo === "editar";

  let db;
  let viewer;
  try {
    ({ db, user: viewer } = await getAdminDatabase());
  } catch (e) {
    const code = /** @type {{ code?: string }} */ (e)?.code;
    if (code === "AUTH") {
      redirect("/login?next=" + encodeURIComponent(`/admin/usuarios/${id}`));
    }
    redirect("/");
  }

  const { data: perfil, error } = await db
    .from("perfil")
    .select("id, nome_completo, perfil_acesso")
    .eq("id", id)
    .maybeSingle();

  if (error || !perfil) notFound();

  let email = null;
  try {
    const { data } = await db.auth.admin.getUserById(id);
    email = data?.user?.email ?? null;
  } catch {
    email = null;
  }

  return (
    <PerfilUsuario
      id={perfil.id}
      nome={perfil.nome_completo}
      email={email}
      perfilAcesso={perfil.perfil_acesso}
      editar={editar}
      viewerId={viewer.id}
    />
  );
}
