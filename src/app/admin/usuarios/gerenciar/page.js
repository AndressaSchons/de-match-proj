import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { listarUsuarios } from "./actions";
import UsuariosView from "./usuarios-view";

export const metadata = {
  title: "Gerenciar Usuários",
};

export default async function UsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await listarUsuarios();

  return (
    <UsuariosView
      usuarios={result.usuarios ?? []}
      listError={result.ok ? null : result.message}
    />
  );
}
