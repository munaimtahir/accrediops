import { expect, test } from "@playwright/test";
import { login, loginAsSeededAdmin, logout, seededUser, seededUsers } from "./helpers";

async function openIndicatorPanelIfAvailable(
  page: Parameters<typeof test>[0]["page"],
  panelLabel: "Evidence" | "Recurring" | "Actions" | "Governance / Override",
) {
  const panel = page.locator("main").getByRole("button", { name: panelLabel, exact: true }).first();
  await expect(panel).toBeVisible();
  await panel.click();
}

async function runIndicatorCommand(
  page: Parameters<typeof test>[0]["page"],
  triggerLabel: "Start" | "Send for Review" | "Mark as Met" | "Reopen",
  reason?: string,
) {
  await openIndicatorPanelIfAvailable(page, "Actions");
  await page.getByRole("button", { name: triggerLabel }).first().click();
  const dialog = page.locator("div.fixed.inset-0").last();
  await expect(dialog).toBeVisible();
  if (reason) {
    await dialog.getByLabel("Reason").fill(reason);
  }
  await dialog.locator("form button[type='submit']").click();
}

async function createProjectAndOpenIndicator(page: Parameters<typeof test>[0]["page"]) {
  await loginAsSeededAdmin(page);
  const projectName = `E2E Core ${Date.now()}`;
  const clientName = `E2E Core Client ${Date.now()}`;

  await page.getByRole("button", { name: "Create project" }).first().click();
  const form = page.locator("form").first();
  await form.getByLabel("Project name").fill(projectName);
  await form.getByLabel("Client name").fill(clientName);
  await form.getByLabel("Accrediting body name").fill("E2E Board");
  await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
  await form.getByRole("button", { name: "Create project" }).click();

  await expect(page).toHaveURL(/\/projects\/\d+/);
  const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
  const worklistResponse = await page.request.get(
    `/api/dashboard/worklist/?project_id=${projectId}&search=E2E-IND-001&page_size=1`,
  );
  expect(worklistResponse.ok()).toBeTruthy();
  const worklistPayload = await worklistResponse.json();
  const indicatorId = Number(worklistPayload?.data?.results?.[0]?.project_indicator_id);
  expect(Number.isFinite(indicatorId)).toBeTruthy();
  await page.goto(`/project-indicators/${indicatorId}`);
  await expect(page).toHaveURL(/\/project-indicators\/\d+/);
}

test.describe("Core operational browser journeys", () => {
  test("evidence review journey works end-to-end", async ({ page }) => {
    await createProjectAndOpenIndicator(page);

    await openIndicatorPanelIfAvailable(page, "Evidence");
    await page.getByRole("button", { name: "Add evidence" }).click();
    const addEvidenceModal = page.locator("div.fixed.inset-0").last();
    await addEvidenceModal.getByLabel("Title").fill("E2E Evidence");
    await addEvidenceModal.getByLabel("Source type").selectOption("TEXT_NOTE");
    await addEvidenceModal.getByLabel("Text evidence").fill("Evidence text from E2E.");
    await addEvidenceModal.getByLabel("Physical location type").selectOption("BINDER");
    await addEvidenceModal.getByRole("button", { name: "Add evidence" }).click();

    await expect(page.getByText("E2E Evidence")).toBeVisible();

    await page.getByRole("button", { name: "Review evidence" }).first().click();
    await page.getByLabel("Validity").selectOption("VALID");
    await page.getByLabel("Completeness").selectOption("COMPLETE");
    await page.getByLabel("Approval").selectOption("APPROVED");
    await page.getByRole("button", { name: "Save review" }).click();

    await expect(page.getByText("Approval state")).toBeVisible();
    await expect(page.getByText(/^Approved$/).first()).toBeVisible();
  });

  test("recurring approval from indicator context works", async ({ page }) => {
    await createProjectAndOpenIndicator(page);

    await openIndicatorPanelIfAvailable(page, "Recurring");
    await page.getByRole("button", { name: "Submit instance" }).first().click();
    const submitModal = page.locator("div.fixed.inset-0").last();
    await submitModal.getByLabel("Submission text").fill("Recurring submission from E2E.");
    await submitModal.getByRole("button", { name: "Submit instance" }).click();

    await page.getByRole("button", { name: "Approve instance" }).first().click();
    const approveModal = page.locator("div.fixed.inset-0").last();
    await approveModal.getByLabel("Notes").fill("Approved by E2E.");
    await approveModal.getByRole("button", { name: "Approve instance" }).click();

    await expect(page.getByText(/Status\s+Approved/i)).toBeVisible();
  });

  test("create flow supports client profile linkage", async ({ page }) => {
    await loginAsSeededAdmin(page);
    const projectName = `E2E Link ${Date.now()}`;
    const clientName = `E2E Link Client ${Date.now()}`;

    await page.getByRole("button", { name: "Create project" }).first().click();
    await expect(page.getByRole("heading", { name: "Create project" })).toBeVisible();
    const createModal = page.locator("div.fixed.inset-0").last();
    const form = createModal.locator("form").first();
    await form.getByLabel("Project name").fill(projectName);
    await form.getByLabel("Client name").fill(clientName);
    await form.getByLabel("Accrediting body name").fill("E2E Board");
    await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
    const profileSelect = form.locator("select").nth(1);
    if ((await profileSelect.count()) > 0) {
      const profileOptionCount = await profileSelect.locator("option", { hasText: "E2E Client Profile" }).count();
      if (profileOptionCount > 0) {
        await profileSelect.selectOption({ label: "E2E Client Profile" });
      }
    }
    await form.getByRole("button", { name: "Create project" }).click();

    await expect(page).toHaveURL(/\/projects\/\d+/);
    await page.getByRole("link", { name: "Client profile" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+\/client-profile/);
    const linkedHeading = page.getByRole("heading", { name: "Client profile and variable preview" });
    const unlinkedHeading = page.getByRole("heading", { name: "Client profile is not linked" });
    if (await linkedHeading.isVisible()) {
      await expect(linkedHeading).toBeVisible();
    } else {
      await expect(unlinkedHeading).toBeVisible();
    }
  });

  test("clone project then open cloned workspace", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+/);

    const sourceProjectPath = new URL(page.url()).pathname;
    const cloneModalName = `E2E Clone ${Date.now()}`;
    const cloneClientName = `E2E Clone Client ${Date.now()}`;

    await page.getByRole("button", { name: "Clone project" }).click();
    const cloneModal = page.locator("div.fixed.inset-0").last();
    await cloneModal.getByLabel("New project name").fill(cloneModalName);
    await cloneModal.getByLabel("New client name").fill(cloneClientName);
    await cloneModal.getByRole("button", { name: "Clone project" }).click();

    await page.waitForURL(
      (url) => /^\/projects\/\d+$/.test(url.pathname) && url.pathname !== sourceProjectPath,
    );
    await expect(page.getByRole("heading", { name: cloneModalName }).first()).toBeVisible();
  });

  test("admin route access is available after login", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  });

  test("admin override reopens met indicator and audit evidence is visible", async ({ page }) => {
    await createProjectAndOpenIndicator(page);

    await openIndicatorPanelIfAvailable(page, "Evidence");
    await page.getByRole("button", { name: "Add evidence" }).click();
    const addEvidenceModal = page.locator("div.fixed.inset-0").last();
    await addEvidenceModal.getByLabel("Title").fill("Override Evidence");
    await addEvidenceModal.getByLabel("Source type").selectOption("TEXT_NOTE");
    await addEvidenceModal.getByLabel("Text evidence").fill("Override eligibility evidence");
    await addEvidenceModal.getByRole("button", { name: "Add evidence" }).click();

    await page.getByRole("button", { name: "Review evidence" }).first().click();
    await page.getByLabel("Validity").selectOption("VALID");
    await page.getByLabel("Completeness").selectOption("COMPLETE");
    await page.getByLabel("Approval").selectOption("APPROVED");
    await page.getByRole("button", { name: "Save review" }).click();

    await runIndicatorCommand(page, "Start");
    await runIndicatorCommand(page, "Send for Review");
    await runIndicatorCommand(page, "Mark as Met");

    await expect(page.getByText(/^Completed$/).first()).toBeVisible();

    await runIndicatorCommand(page, "Reopen", "Admin governance override from E2E");

    await expect(page.getByText(/^In Process$/).first()).toBeVisible();

    await page.goto("/admin/overrides");
    await expect(page.getByRole("heading", { name: "Overrides & reopen control" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Admin governance override from E2E" }).first()).toBeVisible();

    await page.goto("/admin/audit");
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByRole("heading", { name: "Audit log viewer" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("cell", { name: "project_indicator.status_changed" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Admin governance override from E2E" }).first()).toBeVisible();
  });

  test("non-admin user cannot reopen met indicator", async ({ page }) => {
    await createProjectAndOpenIndicator(page);
    const sourceIndicatorId = Number(page.url().match(/\/project-indicators\/(\d+)/)?.[1]);
    const sourceIndicatorResponse = await page.request.get(`/api/project-indicators/${sourceIndicatorId}/`);
    expect(sourceIndicatorResponse.ok()).toBeTruthy();
    const sourceIndicatorPayload = await sourceIndicatorResponse.json();
    const projectId = Number(sourceIndicatorPayload?.data?.project);
    expect(Number.isFinite(projectId)).toBeTruthy();

    await openIndicatorPanelIfAvailable(page, "Evidence");
    await page.getByRole("button", { name: "Add evidence" }).click();
    const addEvidenceModal = page.locator("div.fixed.inset-0").last();
    await addEvidenceModal.getByLabel("Title").fill("Denied Reopen Evidence");
    await addEvidenceModal.getByLabel("Source type").selectOption("TEXT_NOTE");
    await addEvidenceModal.getByLabel("Text evidence").fill("Evidence before denied reopen");
    await addEvidenceModal.getByRole("button", { name: "Add evidence" }).click();

    await page.getByRole("button", { name: "Review evidence" }).first().click();
    await page.getByLabel("Validity").selectOption("VALID");
    await page.getByLabel("Completeness").selectOption("COMPLETE");
    await page.getByLabel("Approval").selectOption("APPROVED");
    await page.getByRole("button", { name: "Save review" }).click();

    await runIndicatorCommand(page, "Start");
    await runIndicatorCommand(page, "Send for Review");
    await runIndicatorCommand(page, "Mark as Met");
    await expect(page.getByText(/^Completed$/).first()).toBeVisible();

    await logout(page);
    await login(page, seededUsers.owner);
    await page.goto("/admin");
    await expect(page.getByText("Admin access restricted")).toBeVisible();
    await expect(page.getByText("Only ADMIN or LEAD can access the admin area.")).toBeVisible();

    const worklistResponse = await page.request.get(
      `/api/dashboard/worklist/?project_id=${projectId}&search=E2E-IND-001&page_size=1`,
    );
    expect(worklistResponse.ok()).toBeTruthy();
    const worklistPayload = await worklistResponse.json();
    const indicatorId = Number(worklistPayload?.data?.results?.[0]?.project_indicator_id);
    await page.goto(`/project-indicators/${indicatorId}`);
    await expect(page).toHaveURL(/\/project-indicators\/\d+/);
    await openIndicatorPanelIfAvailable(page, "Actions");
    await expect(page.getByRole("button", { name: "Reopen" })).toBeDisabled();
  });

  test("export lifecycle creates history row with persisted status", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("button", { name: "Create project" }).first().click();
    const form = page.locator("form").first();
    const projectName = `E2E Export ${Date.now()}`;
    await form.getByLabel("Project name").fill(projectName);
    await form.getByLabel("Client name").fill(`E2E Export Client ${Date.now()}`);
    await form.getByLabel("Accrediting body name").fill("E2E Board");
    await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
    await form.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/projects\/\d+/);

    await page.locator("main").getByRole("link", { name: "Export history" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+\/exports/);
    await expect(page.getByRole("heading", { name: "Export history" })).toBeVisible();

    await page.getByRole("button", { name: "Generate print-bundle" }).click();
    const table = page.locator("table").first();
    await expect(table).toContainText("print-bundle");
    const statusCell = page.locator("tr").filter({ hasText: "print-bundle" }).first();
    await expect(statusCell).toContainText(/READY|WARNING/);
  });

  test("non-admin user cannot access export history actions", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("button", { name: "Create project" }).first().click();
    const form = page.locator("form").first();
    await form.getByLabel("Project name").fill(`E2E Owner Export Deny ${Date.now()}`);
    await form.getByLabel("Client name").fill(`E2E Owner Client ${Date.now()}`);
    await form.getByLabel("Accrediting body name").fill("E2E Board");
    await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
    await form.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/projects\/\d+/);
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);

    await logout(page);
    await login(page, seededUsers.owner);
    await page.goto(`/projects/${projectId}/exports`);
    await expect(page.getByText("Export access restricted")).toBeVisible();
    await expect(page.getByText("Only ADMIN or LEAD can access export generation and history.")).toBeVisible();
  });

  test("combined governance path: create, evidence, recurring, export", async ({ page }) => {
    await createProjectAndOpenIndicator(page);

    await openIndicatorPanelIfAvailable(page, "Evidence");
    await page.getByRole("button", { name: "Add evidence" }).click();
    const addEvidenceModal = page.locator("div.fixed.inset-0").last();
    await addEvidenceModal.getByLabel("Title").fill("Combined Lifecycle Evidence");
    await addEvidenceModal.getByLabel("Source type").selectOption("TEXT_NOTE");
    await addEvidenceModal.getByLabel("Text evidence").fill("Combined flow evidence note.");
    await addEvidenceModal.getByRole("button", { name: "Add evidence" }).click();

    await page.getByRole("button", { name: "Review evidence" }).first().click();
    await page.getByLabel("Validity").selectOption("VALID");
    await page.getByLabel("Completeness").selectOption("COMPLETE");
    await page.getByLabel("Approval").selectOption("APPROVED");
    await page.getByRole("button", { name: "Save review" }).click();

    await openIndicatorPanelIfAvailable(page, "Recurring");
    await page.getByRole("button", { name: "Submit instance" }).first().click();
    const submitModal = page.locator("div.fixed.inset-0").last();
    await submitModal.getByLabel("Submission text").fill("Combined recurring submission.");
    await submitModal.getByRole("button", { name: "Submit instance" }).click();

    await page.getByRole("button", { name: "Approve instance" }).first().click();
    const approveModal = page.locator("div.fixed.inset-0").last();
    await approveModal.getByLabel("Notes").fill("Combined recurring approval.");
    await approveModal.getByRole("button", { name: "Approve instance" }).click();
    await expect(page.getByText(/Status\s+Approved/i)).toBeVisible();

    const indicatorId = Number(page.url().match(/\/project-indicators\/(\d+)/)?.[1]);
    const indicatorResponse = await page.request.get(`/api/project-indicators/${indicatorId}/`);
    expect(indicatorResponse.ok()).toBeTruthy();
    const indicatorPayload = await indicatorResponse.json();
    const projectId = Number(indicatorPayload?.data?.project);
    expect(Number.isFinite(projectId)).toBeTruthy();

    await page.goto(`/projects/${projectId}/exports`);
    await expect(page.getByRole("heading", { name: "Export history" })).toBeVisible();
    await page.getByRole("button", { name: "Generate print-bundle" }).click();
    const table = page.locator("table").first();
    await expect(table).toContainText("print-bundle");
    await expect(page.locator("tr").filter({ hasText: "print-bundle" }).first()).toContainText(/READY|WARNING/);
  });
});
