import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Confirma sessão + papel administrador e devolve o client com service role
 * para operações em `perfil` que o RLS bloquearia para o anon.
 */
export async function getAdminDatabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err = /** @type {Error & { code?: string }} */ (new Error("Sessão expirada. Entre novamente."));
    err.code = "AUTH";
    throw err;
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("perfil_acesso")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.perfil_acesso !== "administrador") {
    const err = /** @type {Error & { code?: string }} */ (
      new Error("Apenas administradores podem realizar esta ação.")
    );
    err.code = "FORBIDDEN";
    throw err;
  }

  let db;
  try {
    db = createAdminClient();
  } catch (e) {
    const err = /** @type {Error & { code?: string }} */ (
      new Error(
        e instanceof Error
          ? e.message
          : "Defina SUPABASE_SERVICE_ROLE_KEY no servidor para gerenciar usuários."
      )
    );
    err.code = "NO_SERVICE_KEY";
    throw err;
  }

  return { user, db, supabase };
}

/** @param {import("@supabase/supabase-js").SupabaseClient} db */
export async function countAdministradores(db) {
  const { count, error } = await db
    .from("perfil")
    .select("*", { count: "exact", head: true })
    .eq("perfil_acesso", "administrador");

  if (error) throw error;
  return count ?? 0;
}
