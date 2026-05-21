// @ts-check
/** @param {import('@playwright/test').Page} page */
export async function loginAsEquipe(page) {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD no .env (usuário Supabase com perfil voluntário, validador ou admin)."
    );
  }

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#login-email").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);

  const [authResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/auth/v1/token") &&
        res.request().method() === "POST",
      { timeout: 25_000 }
    ),
    page.getByRole("button", { name: "ENTRAR" }).click(),
  ]);

  if (!authResponse.ok()) {
    const err = await page.locator("p.message").first().textContent().catch(() => null);
    throw new Error(
      err?.trim() ||
        `Login rejeitado pelo Supabase (HTTP ${authResponse.status()}). Verifique e-mail e senha no .env.`
    );
  }

  await page.waitForFunction(() => !window.location.pathname.startsWith("/login"), {
    timeout: 25_000,
  });

  await page.getByRole("heading", { name: "Animais" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
}
