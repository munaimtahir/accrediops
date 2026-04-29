import { expect, test } from "@playwright/test";
import { loginAsSeededAdmin } from "./helpers";

test.describe("Workflow guidance", () => {
  test("project overview shows next-step guidance and grouped pathways", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    const main = page.locator("main");
    await expect(main.getByText("Next Action")).toBeVisible();
    await expect(main.getByRole("heading", { name: "Operate indicators" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Review readiness" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Export and documentation" })).toBeVisible();
  });

  test("worklist and recurring screens provide action guidance", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    await page.getByRole("link", { name: "Go to worklist" }).click();
    await expect(page.getByText("How to use this screen")).toBeVisible();
    await expect(page.getByText("Fast operator path")).toBeVisible();
    await page.getByRole("link", { name: "Recurring Queue" }).first().click();
    await expect(page.getByText("How this queue works")).toBeVisible();
    await expect(page.getByText("Recurring execution tip")).toBeVisible();
  });
});
