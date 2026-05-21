// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsEquipe } = require("./helpers");

const hasE2E = Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);

test.describe("Login", () => {
  test.skip(!hasE2E, "Configure E2E_USER_EMAIL e E2E_USER_PASSWORD no .env");

  test("usuário da equipe acessa a home após entrar", async ({ page }) => {
    await loginAsEquipe(page);
    await expect(page.getByRole("heading", { name: "Animais" })).toBeVisible();
  });
});
