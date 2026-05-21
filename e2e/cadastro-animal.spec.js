// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsEquipe } = require("./helpers");

const hasE2E = Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);

test.describe("Cadastro de animal", () => {
  test.skip(!hasE2E, "Configure E2E_USER_EMAIL e E2E_USER_PASSWORD no .env");

  test("cadastro mínimo e notificação na home", async ({ page }) => {
    const nome = `E2E Teste ${Date.now()}`;

    await loginAsEquipe(page);
    await page.goto("/animais/cadastro");

    await page.locator('input[name="nome_animal"]').fill(nome);
    await page.locator('select[name="disponibilidade"]').selectOption("disponivel");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("status")).toContainText(/sucesso/i, { timeout: 15_000 });

    await page.goto("/");
    await expect(page.getByText(`Novo: ${nome}`)).toBeVisible({ timeout: 15_000 });
  });
});
