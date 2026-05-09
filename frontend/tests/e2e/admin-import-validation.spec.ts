import { expect, test } from "@playwright/test";

import { loginAsSeededAdmin, seededUser } from "./helpers";

test.describe("Admin framework validation parity", () => {
  test("admin validate sample enforces required inputs and completes with CSV upload", async ({ page }) => {
    await loginAsSeededAdmin(page);

    await page.goto("/admin/import-logs");
    const validateButton = page.getByRole("button", { name: "Validate sample" });
    await expect(validateButton).toBeDisabled();
    await expect(page.getByText("Select a framework before validation.")).toBeVisible();

    await page.getByLabel("Framework").selectOption({ label: seededUser.frameworkName });
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
    const validateResponse = page.waitForResponse((response) =>
      response.url().includes("/api/admin/import/validate-framework/") && response.ok(),
    );
    await validateButton.click();
    await validateResponse;
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
