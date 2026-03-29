import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com privilégios de serviço — usar apenas em Server Actions / Route Handlers.
 * Nunca importe em componentes client nem exponha `SUPABASE_SERVICE_ROLE_KEY` ao browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local para criar usuários pelo app."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
