// @ts-check
import { expect } from "@playwright/test";

/** @param {import('@playwright/test').Locator} locator @param {string} value */
async function fillControlledInput(locator, value) {
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  await locator.click();
  await locator.fill(value);
  try {
    await expect(locator).toHaveValue(value, { timeout: 3_000 });
  } catch {
    await locator.click();
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 5_000 });
  }
}

/** @param {import('@playwright/test').Response} res */
function isPasswordGrantTokenRequest(res) {
  return (
    res.url().includes("/auth/v1/token") &&
    res.url().includes("grant_type=password") &&
    res.request().method() === "POST"
  );
}

/** @param {import('@playwright/test').Page} page */
async function readLoginError(page) {
  const errorEl = page.getByTestId("login-error");
  if (await errorEl.isVisible().catch(() => false)) {
    return (await errorEl.textContent())?.trim() || null;
  }
  return null;
}

/** @param {import('@playwright/test').Page} page */
export async function loginAsEquipe(page) {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD no .env (usuário Supabase com perfil voluntário, validador ou admin)."
    );
  }

  await page.goto("/login", { waitUntil: "load" });

  const emailInput = page.locator("#login-email");
  const passwordInput = page.locator("#login-password");

  await fillControlledInput(emailInput, email);
  await fillControlledInput(passwordInput, password);

  const [authResponse] = await Promise.all([
    page.waitForResponse(isPasswordGrantTokenRequest, { timeout: 25_000 }),
    page.getByRole("button", { name: "ENTRAR" }).click(),
  ]);

  if (!authResponse.ok()) {
    const err = await readLoginError(page);
    throw new Error(
      err ||
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
