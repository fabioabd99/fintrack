import { expect, test } from "@playwright/test";

// Happy path through the whole stack, starting from "Open the demo".
// Needs the database running (docker compose up -d).
test("a signed-in person can record spending and see it counted", async ({
  page,
}) => {
  await page.goto("/sign-in");

  await page.getByRole("button", { name: "Open the demo" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("You can spend")).toBeVisible();

  await page.goto("/transactions");

  const before = await page
    .getByText(/\d+ movements?/)
    .first()
    .innerText();

  await page
    .locator("main")
    .getByRole("button", { name: "Add transaction" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // comma decimal on purpose
  await dialog.getByLabel("Amount").fill("12,34");
  await dialog.getByLabel("Note").fill("Playwright smoke test");
  await dialog.getByRole("button", { name: "Add €12.34" }).click();

  await expect(dialog).toBeHidden();

  await expect(page.getByText("Playwright smoke test")).toBeVisible();
  await expect(page.getByText(/−€12\.34/)).toBeVisible();

  const after = await page
    .getByText(/\d+ movements?/)
    .first()
    .innerText();

  expect(parseInt(after, 10)).toBe(parseInt(before, 10) + 1);

  // clean up
  await page.getByText("Playwright smoke test").click();
  await dialog.getByRole("button", { name: "Delete" }).click();
  await dialog.getByRole("button", { name: "Delete", exact: true }).last().click();

  await expect(page.getByText("Playwright smoke test")).toBeHidden();
});
