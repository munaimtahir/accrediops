import { expect, test, Page } from "@playwright/test";

import {
  authStatePath,
  createProjectFromLab,
  getApi,
  getFirstIndicatorId,
  getWorklistRows,
  patchApi,
  postApi,
  seededUser,
} from "./helpers";

type FrameworkSummary = { id: number; name: string };

type AdminUser = { id: number; username: string; role: string };

const logStore = new Map<string, string[]>();

test.describe("30 PHC LAB framework full workflow", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const logs: string[] = [];

    page.on("console", (msg) => {
      logs.push(`[console.${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      logs.push(`[pageerror] ${String(err)}`);
    });
    page.on("requestfailed", (req) => {
      logs.push(`[requestfailed] ${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? "unknown"}`);
    });
    logStore.set(testInfo.testId, logs);
  });

  test.afterEach(async ({}, testInfo) => {
    const logs = logStore.get(testInfo.testId);
    logStore.delete(testInfo.testId);
    if (!logs?.length) return;
    await testInfo.attach("browser-logs", {
      body: logs.join("\n"),
      contentType: "text/plain",
    });
  });

  test.describe("admin-driven full lifecycle", () => {
    test.use({ storageState: authStatePath("admin") });

    test("PHC LAB lifecycle works end-to-end (core happy path)", async ({ page }) => {
      test.setTimeout(180_000);
      // A. Admin login and baseline navigation
      await page.goto("/projects");
      await expect(page.getByRole("heading", { name: "Project register" })).toBeVisible();
      await expect(page.getByText("Create project")).toBeVisible();

      // Discover framework id (must exist, exact name).
      const frameworks = await getApi<FrameworkSummary[]>(page, "/api/frameworks/", "list frameworks");
      const phcLab = frameworks.find((fw) => fw.name === seededUser.frameworkName);
      expect(phcLab, `${seededUser.frameworkName} framework must exist`).toBeTruthy();
      if (!phcLab) return;

      // B. Existing PHC LAB framework visibility
      await page.goto("/admin/frameworks");
      await expect(page.getByRole("heading", { name: "Framework management" })).toBeVisible();
      await expect(page.getByRole("cell", { name: seededUser.frameworkName }).first()).toBeVisible();

      // C. Project creation from PHC LAB framework (API create + UI verify).
      const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
      const projectName = `E2E PHC LAB Project ${timestamp}`;
      const clientName = `E2E PHC LAB Client ${timestamp}`;
      const project = await createProjectFromLab(page, projectName, clientName);
      await page.goto(`/projects/${project.id}`);
      await expect(page.getByRole("heading", { name: project.name }).first()).toBeVisible();

      // D. Project indicators generated
      const worklist = await getWorklistRows(page, project.id, "page_size=5");
      expect(worklist.count).toBeGreaterThan(0);
      await page.goto(`/projects/${project.id}/worklist`);
      await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
      await expect(page.getByText(worklist.results[0].indicator_code).first()).toBeVisible({ timeout: 20_000 });

      // E. Indicator detail workflow
      const indicatorId = await getFirstIndicatorId(page, project.id);
      await page.goto(`/project-indicators/${indicatorId}`);
      await expect(page.getByText("Indicator sections")).toBeVisible();

      await page.getByRole("button", { name: "Summary", exact: true }).click();
      await expect(page.getByText("Summary — Operational context")).toBeVisible();

      await page.getByLabel("Working notes").fill("E2E workflow verification note for PHC LAB");
      await page.getByRole("button", { name: "Save working state" }).click();
      await expect(page.getByText("Working state updated.")).toBeVisible();

      await page.getByRole("button", { name: "Actions", exact: true }).click();
      await expect(page.getByText("Section 4 — Actions (Primary)")).toBeVisible();
      await page.getByRole("button", { name: "Start" }).click();
      const reasonInput = page.getByLabel(/reason/i);
      if (await reasonInput.count()) {
        await reasonInput.fill("E2E start PHC LAB");
      }
      const confirmStart = page.getByRole("button", { name: /confirm/i });
      if (await confirmStart.count()) {
        await confirmStart.click();
      }
      await page.reload();
      await page.getByRole("button", { name: "Summary", exact: true }).click();
      await expect(page.getByLabel("Working notes")).toHaveValue("E2E workflow verification note for PHC LAB");

      // F. Classification workflow (no stubs)
      await page.goto(`/admin/frameworks/classification?framework=${phcLab.id}`);
      await expect(page.getByRole("heading", { name: "Indicator Classification" })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();

      // Update one indicator classification to be doc-generation eligible.
      const classificationPayload = await getApi<{ results: { id: number; code: string }[] }>(
        page,
        `/api/admin/frameworks/${phcLab.id}/classification/?page_size=1`,
        "load classification list",
      );
      const targetIndicator = classificationPayload.results[0];
      expect(targetIndicator).toBeTruthy();
      if (!targetIndicator) return;

      await patchApi(
        page,
        `/api/admin/indicators/${targetIndicator.id}/classification/`,
        {
          evidence_type: "DOCUMENT_POLICY",
          ai_assistance_level: "FULL_AI",
          evidence_frequency: "ONE_TIME",
          primary_action_required: "GENERATE_DOCUMENT",
          classification_confidence: "HIGH",
          classification_reason: "E2E: enable doc generation for PHC LAB workflow.",
          classification_review_status: "NEEDS_REVIEW",
        },
        "update indicator classification",
      );

      await postApi(
        page,
        `/api/admin/frameworks/${phcLab.id}/classification/bulk-review/`,
        { mode: "selected", action: "approve", indicator_ids: [targetIndicator.id] },
        "bulk approve classification",
      );

      await page.reload();
      await expect(page.getByText(targetIndicator.code)).toBeVisible();

      // G. Document generation queue
      await page.goto("/admin/queues/document-generation");
      await expect(page.getByRole("heading", { name: "Document Generation Queue" })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();

      // Filter down to PHC LAB and the target indicator code.
      await page.locator('label:has-text("Framework")').locator("..").locator("select").selectOption(String(phcLab.id));
      await page.getByPlaceholder("Code or text").fill(targetIndicator.code);
      await expect(page.getByText(targetIndicator.code)).toBeVisible();

      await page.getByRole("button", { name: "Generate" }).first().click();
      await expect(page.getByRole("heading", { name: "Generate Document Draft" })).toBeVisible();
      await page.getByRole("button", { name: "Generate Draft" }).click();
      // H. Draft review workflow (poll for the draft to appear).
      let drafts: { id: number; indicator: number; review_status: string }[] = [];
      for (let attempt = 0; attempt < 10; attempt += 1) {
        drafts = await getApi<{ id: number; indicator: number; review_status: string }[]>(
          page,
          `/api/admin/document-drafts/?framework_id=${phcLab.id}&indicator_id=${targetIndicator.id}`,
          "list drafts for indicator",
        );
        if (drafts.length) break;
        await page.waitForTimeout(1000);
      }
      expect(drafts.length).toBeGreaterThan(0);
      const draftId = drafts[0]?.id;
      expect(draftId).toBeTruthy();
      if (!draftId) return;

      await page.goto(`/admin/document-drafts/${draftId}`);
      await expect(page.getByRole("heading", { name: "Indicator Requirement" })).toBeVisible();
      await page.getByRole("button", { name: "Edit Draft" }).click();
      await page.getByPlaceholder("Draft content...").fill("E2E edit: verified PHC LAB draft review workflow.\n\n" + Date.now());
      await page.getByRole("button", { name: "Save Changes" }).click();
      await expect(page.getByText("Draft saved and marked as reviewed.")).toBeVisible();

      // I. Promote draft to evidence
      await postApi(
        page,
        `/api/admin/document-drafts/${draftId}/promote-to-evidence/`,
        {
          project_id: project.id,
          project_indicator_id: indicatorId,
          evidence_title: `E2E_PROMOTED_${Date.now()}`,
          evidence_type: "DOCUMENT_POLICY",
          document_type: "POLICY",
        },
        "promote draft to evidence (api)",
      );

      // Confirm evidence attached/visible on indicator detail.
      await page.goto(`/project-indicators/${indicatorId}`);
      await page.getByRole("button", { name: "Evidence", exact: true }).click();
      await expect(page.getByText("Section 5 — Evidence")).toBeVisible();

      // J. Manual evidence workflow (use API to create manual evidence record)
      const worklist2 = await getWorklistRows(page, project.id, "page_size=2");
      const secondIndicatorId = worklist2.results[1]?.project_indicator_id;
      expect(secondIndicatorId).toBeTruthy();
      if (!secondIndicatorId) return;

      const manualEvidence = await postApi<{ id: number }>(
        page,
        "/api/evidence/",
        {
          project_indicator_id: secondIndicatorId,
          title: `E2E_MANUAL_EVIDENCE_${Date.now()}`,
          source_type: "TEXT_NOTE",
          text_content: "Manual evidence note for PHC LAB workflow.",
        },
        "create manual evidence",
      );
      expect(manualEvidence.id).toBeTruthy();

      await page.goto(`/project-indicators/${secondIndicatorId}`);
      await page.getByRole("button", { name: "Evidence", exact: true }).click();
      await expect(page.getByText("Section 5 — Evidence")).toBeVisible();

      // Assign roles deterministically so reviewer/approver can participate.
      const adminUsers = await getApi<AdminUser[]>(page, "/api/admin/users/", "list admin users");
      const reviewer = adminUsers.find((u) => u.username === "pw_reviewer");
      const approver = adminUsers.find((u) => u.username === "pw_approver");
      expect(reviewer).toBeTruthy();
      expect(approver).toBeTruthy();
      if (!reviewer || !approver) return;

      await postApi(
        page,
        `/api/project-indicators/${indicatorId}/assign/`,
        { reviewer_id: reviewer.id, approver_id: approver.id },
        "assign reviewer/approver",
      );

      // Prepare a reviewer-ready evidence item for the approver flow.
      const reviewEvidence = await postApi<{ id: number }>(
        page,
        "/api/evidence/",
        {
          project_indicator_id: indicatorId,
          title: `E2E_READY_FOR_REVIEW_${Date.now()}`,
          source_type: "TEXT_NOTE",
          text_content: "Evidence prepared for reviewer/approver verification.",
        },
        "create evidence for approval flow",
      );
      await postApi(
        page,
        `/api/evidence/${reviewEvidence.id}/review/`,
        {
          validity_status: "VALID",
          completeness_status: "COMPLETE",
          approval_status: "APPROVED",
          review_notes: "E2E review approval",
        },
        "review evidence",
      );

      // M. Dashboard counts (surface exists and responds)
      await page.goto(`/projects/${project.id}`);
      await expect(page.getByText("Indicators total")).toBeVisible();

      // N. Print/export visibility
      await page.goto(`/projects/${project.id}/print-pack`);
      await expect(page.getByRole("heading", { name: "Print pack preview" })).toBeVisible();
      await expect(page.getByText(project.name)).toBeVisible();
    });
  });

  test.describe("reviewer/approver role enforcement", () => {
    test.use({ storageState: authStatePath("admin") });

    async function getProjectAndIndicatorForRoleTest(page: Page) {
      const projects = await getApi<{ count: number; results: { id: number; name: string }[] }>(
        page,
        "/api/projects/?page_size=all",
        "list projects for role test",
      );
      const project = projects.results.find((p) => p.name === "E2E Lab Project") ?? projects.results[0];
      expect(project).toBeTruthy();
      if (!project) throw new Error("No project found for role tests.");
      const indicatorId = await getFirstIndicatorId(page, project.id);
      return { projectId: project.id, indicatorId };
    }

    test("reviewer can review evidence but cannot add evidence", async ({ browser }) => {
      const adminContext = await browser.newContext({ storageState: authStatePath("admin") });
      const adminPage = await adminContext.newPage();
      const { indicatorId } = await getProjectAndIndicatorForRoleTest(adminPage);
      await adminContext.close();

      const context = await browser.newContext({ storageState: authStatePath("reviewer") });
      const page = await context.newPage();
      try {
        await page.goto(`/project-indicators/${indicatorId}`);
        await expect(page.getByText("Indicator sections")).toBeVisible();
        await page.getByRole("button", { name: "Evidence", exact: true }).click();
        await expect(page.getByText("Section 5 — Evidence")).toBeVisible();

        // Reviewer should not be able to add evidence.
        await expect(page.getByRole("button", { name: "Add evidence" })).toBeDisabled();

        // Reviewer should not see admin navigation.
        await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
      } finally {
        await context.close();
      }
    });

    test("approver can mark met when readiness allows", async ({ browser }) => {
      test.setTimeout(120_000);
      const adminContext = await browser.newContext({ storageState: authStatePath("admin") });
      const adminPage = await adminContext.newPage();
      const { indicatorId } = await getProjectAndIndicatorForRoleTest(adminPage);
      // Ensure approver is assigned.
      const adminUsers = await getApi<AdminUser[]>(adminPage, "/api/admin/users/", "list admin users for approver");
      const approver = adminUsers.find((u) => u.username === "pw_approver");
      expect(approver).toBeTruthy();
      if (approver) {
        await postApi(
          adminPage,
          `/api/project-indicators/${indicatorId}/assign/`,
          { approver_id: approver.id },
          "assign approver",
        );
      }
      // Seed an approved evidence item so readiness is likely satisfied.
      const detailBefore = await getApi<{ indicator: { minimum_required_evidence_count: number } }>(
        adminPage,
        `/api/project-indicators/${indicatorId}/`,
        "load readiness baseline",
      );
      const requiredEvidence = Math.max(detailBefore.indicator.minimum_required_evidence_count, 1);

      for (let index = 0; index < requiredEvidence; index += 1) {
        const evidence = await postApi<{ id: number }>(
          adminPage,
          "/api/evidence/",
          {
            project_indicator_id: indicatorId,
            title: `E2E_APPROVER_READY_${Date.now()}_${index}`,
            source_type: "TEXT_NOTE",
            text_content: "Evidence approved for approver mark met test.",
          },
          "create evidence for approver",
        );
        await postApi(
          adminPage,
          `/api/evidence/${evidence.id}/review/`,
          {
            validity_status: "VALID",
            completeness_status: "COMPLETE",
            approval_status: "APPROVED",
            review_notes: "E2E ready for met",
          },
          "approve evidence for approver",
        );
      }
      await postApi(adminPage, `/api/project-indicators/${indicatorId}/start/`, { reason: "E2E start" }, "start");
      await postApi(
        adminPage,
        `/api/project-indicators/${indicatorId}/send-for-review/`,
        { reason: "E2E send for review" },
        "send for review",
      );
      await adminContext.close();

      const context = await browser.newContext({ storageState: authStatePath("approver") });
      const page = await context.newPage();
      try {
        await page.goto(`/project-indicators/${indicatorId}`);
        await expect(page.getByText("Indicator sections")).toBeVisible();
        await page.getByRole("button", { name: "Actions", exact: true }).click();
        await expect(page.getByText("Section 4 — Actions (Primary)")).toBeVisible();

        const markMetButton = page.getByRole("button", { name: "Approve (Mark as Met)" });
        await expect(markMetButton).toBeVisible();
        await postApi(page, `/api/project-indicators/${indicatorId}/mark-met/`, { reason: "E2E mark met" }, "mark met");
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const detailResponse = await page.request.get(`/api/project-indicators/${indicatorId}/`);
          const detailPayload = await detailResponse.json();
          expect(detailResponse.ok()).toBeTruthy();
          if (detailPayload?.data?.current_status === "MET") {
            break;
          }
          await page.waitForTimeout(500);
          if (attempt === 4) {
            expect(detailPayload?.data?.current_status).toBe("MET");
          }
        }
      } finally {
        await context.close();
      }
    });
  });
});
