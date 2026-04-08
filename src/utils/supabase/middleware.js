import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/** Rotas acessíveis sem sessão (somente prefixo exato). */
function isPublicPath(pathname) {
  return pathname === "/login" || pathname === "/login/";
}

/**
 * Atualiza cookies de sessão e bloqueia rotas privadas sem usuário autenticado.
 */
export async function updateSession(request) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[auth] Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env"
    );
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const returnTo = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", returnTo);

    const redirectResponse = NextResponse.redirect(loginUrl);

    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    return redirectResponse;
  }

  return response;
}
