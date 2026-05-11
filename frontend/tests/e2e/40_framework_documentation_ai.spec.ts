import { expect, test } from "@playwright/test";

import { loginAsSeededAdmin, seededUser } from "./helpers";

test.describe("Framework Documentation AI", () => {
  test("admin can generate a framework draft and it remains advisory-only", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.goto("/framework-documentation-ai");

    await expect(page.getByRole("heading", { name: "Framework Documentation AI" })).toBeVisible();
    await expect(page.getByText("AI-generated draft — requires human review")).toBeVisible();

    // Select framework
    await page.getByRole("combobox", { name: "Framework" }).selectOption({ label: seededUser.frameworkName });

    // Select document type
    await page.getByRole("combobox", { name: "Document type" }).selectOption("SOP");

    // Select scope and a single indicator
    await page.getByRole("combobox", { name: "Scope" }).selectOption("single_indicator");
    await page.getByRole("combobox", { name: "Indicator" }).selectOption({ index: 1 }); // first real option

    await page.getByRole("button", { name: "Generate draft" }).click();

    // Preview shows advisory content and does not claim completion.
    const preview = page.getByRole("textbox", { name: "Title" });
    await expect(preview).toBeVisible();
    await expect(page.getByText(/AI Advisory Disclaimer/i)).toBeVisible();
    await expect(page.getByText("AI-generated draft — requires human review")).toBeVisible();

    // Draft remains advisory-only in the API response (visible in recent drafts list).
    await expect(page.getByText(/Advisory:\s*true/i).first()).toBeVisible();
  });
});
