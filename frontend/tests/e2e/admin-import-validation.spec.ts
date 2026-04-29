import { expect, test } from "@playwright/test";

import { loginAsSeededAdmin, seededUser } from "./helpers";

async function ensureProjectId(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/projects");
  const existingProjectLink = page.locator("main").getByRole("link", { name: "Open project" }).first();
  if ((await existingProjectLink.count()) > 0) {
    await existingProjectLink.click();
    return Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
  }

  const projectName = `E2E Validate ${Date.now()}`;
  const clientName = `E2E Validate Client ${Date.now()}`;
  await page.locator("main").getByRole("button", { name: "Create project" }).first().click();
  const form = page.locator("form").first();
  await form.getByLabel("Project name").fill(projectName);
  await form.getByLabel("Client name").fill(clientName);
  await form.getByLabel("Accrediting body name").fill("E2E Board");
  await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
  await form.getByRole("button", { name: "Create project" }).click();
  await expect(page).toHaveURL(/\/projects\/\d+/);
  return Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
}

test.describe("Admin framework validation parity", () => {
  test("admin validate sample enforces required inputs and completes with CSV upload", async ({ page }) => {
    await loginAsSeededAdmin(page);
    const projectId = await ensureProjectId(page);

    await page.goto("/admin/import-logs");
    const validateButton = page.getByRole("button", { name: "Validate sample" });
    await expect(validateButton).toBeDisabled();
    await expect(page.getByText("Select a project before validation.")).toBeVisible();

    await page.getByLabel("Project").selectOption(String(projectId));
    await expect(validateButton).toBeDisabled();
    await expect(page.getByText("Select a CSV file before validation.")).toBeVisible();

    await page.getByLabel("Checklist CSV file").setInputFiles({
      name: "validate.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        [
          "area_code,area_name,standard_code,standard_name,indicator_code,indicator_text",
          "A1,Area One,STD1,Standard One,IND-1,Indicator one",
        ].join("\n"),
      ),
    });

    await expect(validateButton).toBeEnabled();
    await validateButton.click();
    await expect(page.getByText(/Validation rows processed:/i)).toBeVisible();
  });

  test("authenticated navigation stays on proxy origin", async ({ page, baseURL }) => {
    await loginAsSeededAdmin(page);
    await page.goto("/projects");

    const expectedOrigin = baseURL ? new URL(baseURL).origin : "http://127.0.0.1:18080";
    const currentOrigin = new URL(page.url()).origin;
    expect(currentOrigin).toBe(expectedOrigin);
    expect(page.url()).not.toContain(":8000");
  });
});
