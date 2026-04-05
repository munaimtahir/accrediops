import { expect, Page } from "@playwright/test";

export const seededUser = {
  username: "e2e_admin",
  password: "x",
  frameworkName: "E2E Framework",
} as const;

export const seededUsers = {
  admin: "e2e_admin",
  lead: "e2e_lead",
  owner: "e2e_owner",
  reviewer: "e2e_reviewer",
  approver: "e2e_approver",
} as const;

export async function login(page: Page, username: string, password = seededUser.password) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/projects/);
}

export async function loginAsSeededAdmin(page: Page) {
  await login(page, seededUsers.admin);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
}
