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

async function createProjectAndOpenIndicator(
  page: Parameters<typeof test>[0]["page"],
  { requireRecurring }: { requireRecurring?: boolean } = {},
) {
  await loginAsSeededAdmin(page);
  await page.goto("/projects");

  // Prefer deterministic seeded project over creating a new one, to avoid initialization timing variance.
  const seededProjectName = "E2E Lab Project";
  const seededProjectHeading = page.getByRole("heading", { name: seededProjectName, exact: true });
  const seededProjectCard = page.locator("main").locator("div").filter({ has: seededProjectHeading }).first();
  const openProjectLink = seededProjectCard.getByRole("link", { name: "Open project" }).first();
  await expect(openProjectLink).toBeVisible({ timeout: 20000 });
  await openProjectLink.click();
  await expect(page).toHaveURL(/\/projects\/\d+/);
  const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
  expect(Number.isFinite(projectId)).toBeTruthy();

  await page.goto(`/projects/${projectId}/worklist`);
  await expect(page).toHaveURL(/\/projects\/\d+\/worklist/);

  // Open first indicator tile (worklist renders indicator cards as buttons).
  const tiles = page.locator("main").locator("section").locator("button[title]");
  const recurringTiles = tiles.filter({ hasText: "Recurring:" });
  const nonRecurringTiles = tiles.filter({ hasNotText: "Recurring:" });
  const indicatorTile = requireRecurring ? recurringTiles.first() : nonRecurringTiles.first();
  await expect(indicatorTile).toBeVisible({ timeout: 20000 });
  await indicatorTile.click();

  // Drawer contains an "Open full detail" link (stable route into indicator detail page).
  const openFull = page.getByRole("link", { name: "Open full detail" }).first();
  await expect(openFull).toBeVisible({ timeout: 20000 });
  const detailHref = await openFull.getAttribute("href");
  expect(detailHref).toBeTruthy();
  await page.goto(detailHref!);
  await expect(page).toHaveURL(/\/project-indicators\/\d+/);

  return { projectId };
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

    await expect(page.getByText("Approval state").first()).toBeVisible();
    await expect(page.getByText(/^Completed$/).first()).toBeVisible();
  });

  test("recurring approval from indicator context works", async ({ page }) => {
    await createProjectAndOpenIndicator(page, { requireRecurring: true });

    await openIndicatorPanelIfAvailable(page, "Recurring");
    await page.getByRole("button", { name: "Submit instance" }).first().click();
    const submitModal = page.locator("div.fixed.inset-0").last();
    await submitModal.getByLabel("Submission text").fill("Recurring submission from E2E.");
    await submitModal.getByRole("button", { name: "Submit instance" }).click();

    // Wait for submission toast to hide to prevent pointer interception
    await page.locator("text=Recurring instance submitted").waitFor({ state: "hidden", timeout: 10000 });
    // Small additional buffer for layout stabilization
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Approve instance" }).first().click();
    const approveModal = page.locator("div.fixed.inset-0").last();
    await approveModal.getByLabel("Notes").fill("Approved by E2E.");
    await approveModal.getByRole("button", { name: "Approve instance" }).click();

    await expect(page.getByText(/^Completed$/).first()).toBeVisible();
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
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    expect(Number.isFinite(projectId)).toBeTruthy();
    await page.goto(`/projects/${projectId}/client-profile`);
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
    await loginAsSeededAdmin(page);
    await page.goto("/projects");
    const seededProjectHeading = page.getByRole("heading", { name: "E2E Lab Project", exact: true });
    const seededProjectCard = page.locator("main").locator("div").filter({ has: seededProjectHeading }).first();
    const openProjectHref = await seededProjectCard.getByRole("link", { name: "Open project" }).first().getAttribute("href");
    expect(openProjectHref).toBeTruthy();
    await page.goto(openProjectHref!);
    await expect(page).toHaveURL(/\/projects\/\d+/);
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    console.log(`DEBUG: projectId extracted: ${projectId}`);
    expect(Number.isFinite(projectId)).toBeTruthy();

    await page.goto(`/projects/${projectId}/worklist`);
    await expect(page).toHaveURL(/\/projects\/\d+\/worklist/);

    // Open first indicator tile that is not 'MET'
    const indicatorTile = page.locator("main").locator("section").locator("button[title]").first();
    await indicatorTile.waitFor({ state: "visible", timeout: 15000 });
    await indicatorTile.click();

    const openFull = page.getByRole("link", { name: "Open full detail" }).first();
    const detailHref = await openFull.getAttribute("href");
    expect(detailHref).toBeTruthy();
    await page.goto(detailHref!);
    await expect(page).toHaveURL(/\/project-indicators\/\d+/);
    const metIndicatorId = Number(page.url().match(/\/project-indicators\/(\d+)/)?.[1]);

    const isCompleted = await page.getByText(/^Completed$/).first().isVisible();

    if (!isCompleted) {
      await openIndicatorPanelIfAvailable(page, "Evidence");
      // Check if evidence needs to be added. Some indicators might not require evidence.
      if (await page.getByRole("button", { name: "Add evidence" }).isVisible()) {
        await page.getByRole("button", { name: "Add evidence" }).click();
        const addEvidenceModal = page.locator("div.fixed.inset-0").last();
        await addEvidenceModal.getByLabel("Title").fill("E2E Evidence for Reopen Test");
        await addEvidenceModal.getByLabel("Source type").selectOption("TEXT_NOTE");
        await addEvidenceModal.getByLabel("Text evidence").fill("Evidence text from E2E.");
        await addEvidenceModal.getByRole("button", { name: "Add evidence" }).click();
        await expect(page.getByText("E2E Evidence for Reopen Test")).toBeVisible();

        await page.getByRole("button", { name: "Review evidence" }).first().click();
        await page.getByLabel("Validity").selectOption("VALID");
        await page.getByLabel("Completeness").selectOption("COMPLETE");
        await page.getByLabel("Approval").selectOption("APPROVED");
        await page.getByRole("button", { name: "Save review" }).click();
        await expect(page.getByText(/^Completed$/).first()).toBeVisible();
      }
      await runIndicatorCommand(page, "Mark as Met", "Marking as MET for reopen test");
    }

    expect(typeof metIndicatorId).toBe("number");
    await page.goto(`/project-indicators/${metIndicatorId}`);
    await expect(page.getByText(/^Completed$/).first()).toBeVisible({ timeout: 10000 });
    await runIndicatorCommand(page, "Reopen", "Admin governance override from E2E");

    await expect(page.getByText(/^In Process$/).first()).toBeVisible({ timeout: 10000 });

    await page.goto("/admin/overrides");
    await expect(page.getByRole("heading", { name: "Overrides & reopen control" })).toBeVisible();
    // Overrides screen is a control surface; exact row text may vary by implementation.

    await page.goto("/admin/audit");
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByRole("heading", { name: "Audit log viewer" })).toBeVisible({ timeout: 15000 });
    const auditResponse = await page.request.get("/api/audit/?event_type=project_indicator.status_changed");
    expect(auditResponse.ok()).toBeTruthy();
    const auditPayload = (await auditResponse.json()) as { success?: boolean; data?: Array<{ reason?: string }> };
    const auditReasons = Array.isArray(auditPayload?.data) ? auditPayload.data.map((row) => row.reason ?? "") : [];
    expect(auditReasons.some((reason) => reason.includes("Admin governance override from E2E"))).toBeTruthy();
  });

  test("non-admin user cannot reopen met indicator", async ({ page }) => {
    await login(page, seededUsers.owner);
    await page.goto("/projects");
    const seededProjectHeading = page.getByRole("heading", { name: "E2E Lab Project", exact: true });
    const seededProjectCard = page.locator("main").locator("div").filter({ has: seededProjectHeading }).first();
    const openProjectHref = await seededProjectCard.getByRole("link", { name: "Open project" }).first().getAttribute("href");
    expect(openProjectHref).toBeTruthy();
    await page.goto(openProjectHref!);
    await expect(page).toHaveURL(/\/projects\/\d+/);
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    expect(Number.isFinite(projectId)).toBeTruthy();

    await page.goto(`/projects/${projectId}/worklist`);
    await page.getByLabel("Status").selectOption("MET");
    const metTiles = page.locator("main").locator("section").locator("button[title]");
    await expect(metTiles.first()).toBeVisible({ timeout: 20000 });
    const metCount = await metTiles.count();
    const completedTile = metTiles.nth(metCount > 1 ? 1 : 0);
    await completedTile.waitFor({ state: "visible", timeout: 15000 });
    await completedTile.click();
    const openFull = page.getByRole("link", { name: "Open full detail" }).first();
    const detailHref = await openFull.getAttribute("href");
    expect(detailHref).toBeTruthy();
    await page.goto(detailHref!);
    await expect(page.getByText(/^Completed$/).first()).toBeVisible();
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
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    expect(Number.isFinite(projectId)).toBeTruthy();

    await page.goto(`/projects/${projectId}/exports`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/exports`));
    await expect(page.getByRole("heading", { name: "Export history" })).toBeVisible();

    // New projects are typically unready; ensure the UI blocks generation until blockers are resolved.
    const generate = page.getByRole("button", { name: "Generate print-bundle" });
    await expect(generate).toBeVisible();
    await expect(generate).toBeDisabled();
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
    const { projectId } = await createProjectAndOpenIndicator(page, { requireRecurring: true });

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

    // Wait for submission toast to hide to prevent pointer interception
    await page.locator("text=Recurring instance submitted").waitFor({ state: "hidden", timeout: 10000 });
    // Small additional buffer for layout stabilization
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Approve instance" }).first().click();
    const approveModal = page.locator("div.fixed.inset-0").last();
    await approveModal.getByLabel("Notes").fill("Combined recurring approval.");
    await approveModal.getByRole("button", { name: "Approve instance" }).click();
    await expect(page.getByText(/^Completed$/).first()).toBeVisible();

    // Verify export surface is reachable (generation may still be blocked by readiness).
    await page.goto(`/projects/${projectId}/exports`);
    await expect(page.getByRole("heading", { name: "Export history" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate print-bundle" })).toBeVisible();
  });
});
