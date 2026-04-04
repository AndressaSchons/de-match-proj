import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import UsuariosView from "./usuarios-view";

export const metadata = {
  title: "Gerenciar Usuários",
};

export default async function UsuariosPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: usuarios } = await supabase
    .from("perfil")
    .select("id, nome, email, perfil_acesso")
    .order("nome", { ascending: true });

  return <UsuariosView usuarios={usuarios ?? []} />;
}
