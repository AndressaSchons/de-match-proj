import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Garante sessão + perfil `administrador`. Usar em layouts/páginas server do painel admin.
 */
export async function getAdminUserOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.perfil_acesso !== "administrador") {
    redirect("/");
  }

  return { user, supabase };
}
