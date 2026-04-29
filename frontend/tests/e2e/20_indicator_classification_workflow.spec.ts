import { test, expect, Route } from "@playwright/test";
import path from "node:path";

const AUTH_DIR = path.resolve(__dirname, ".auth");

test.describe("Indicator Classification Workflow", () => {
  test("admin reviews, edits, approves, and filters saved classifications", async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();

    let row = {
      id: 501,
      framework: 77,
      area_id: 7,
      area_code: "A1",
      area_name: "Patient Safety",
      standard_id: 8,
      standard_code: "S1",
      standard_name: "Medication Governance",
      code: "IND-501",
      text: "Approved medication policy is available.",
      required_evidence_description: "Policy document",
      document_type: "POLICY",
      fulfillment_guidance: "Prepare and review policy.",
      is_recurring: false,
      recurrence_frequency: "NONE",
      recurrence_mode: "EITHER",
      minimum_required_evidence_count: 1,
      reusable_template_allowed: false,
      evidence_reuse_policy: "NONE",
      is_active: true,
      sort_order: 1,
      evidence_type: "MANUAL_REVIEW",
      ai_assistance_level: "",
      evidence_frequency: "",
      primary_action_required: "",
      classification_confidence: "",
      classification_reason: "",
      classification_review_status: "UNCLASSIFIED",
      classified_by_ai_at: null,
      classification_reviewed_by: null,
      classification_reviewed_by_username: "",
      classification_reviewed_at: null,
      classification_version: 0,
    };

    async function fulfillClassification(route: Route) {
      await route.fulfill({
        json: {
          success: true,
          data: {
            framework: { id: 77, name: "Mock Framework", description: "" },
            summary: {
              total: 1,
              unclassified: row.classification_review_status === "UNCLASSIFIED" ? 1 : 0,
              ai_suggested: row.classification_review_status === "AI_SUGGESTED" ? 1 : 0,
              needs_review: row.classification_review_status === "NEEDS_REVIEW" ? 1 : 0,
              human_reviewed: row.classification_review_status === "HUMAN_REVIEWED" ? 1 : 0,
              full_ai: row.ai_assistance_level === "FULL_AI" ? 1 : 0,
              recurring: row.evidence_frequency === "RECURRING" ? 1 : 0,
              physical_no_ai: row.ai_assistance_level === "NO_AI" || row.evidence_type === "PHYSICAL_FACILITY" ? 1 : 0,
            },
            results: [row],
          },
        },
      });
    }

    await page.route("**/api/admin/frameworks/", async (route) => {
      await route.fulfill({ json: { success: true, data: [{ id: 77, name: "Mock Framework", description: "" }] } });
    });
    await page.route("**/api/admin/frameworks/77/classification/**", fulfillClassification);
    await page.route("**/api/admin/frameworks/77/classify-indicators/", async (route) => {
      row = {
        ...row,
        evidence_type: "DOCUMENT_POLICY",
        ai_assistance_level: "FULL_AI",
        evidence_frequency: "ONE_TIME",
        primary_action_required: "GENERATE_DOCUMENT",
        classification_confidence: "HIGH",
        classification_reason: "Policy can be drafted.",
        classification_review_status: "AI_SUGGESTED",
        classified_by_ai_at: new Date().toISOString(),
        classification_version: 1,
      };
      await route.fulfill({
        json: {
          success: true,
          data: { total_requested: 1, classified_count: 1, skipped_count: 0, failed_count: 0, needs_review_count: 0, errors: [] },
        },
      });
    });
    await page.route("**/api/admin/indicators/501/classification/", async (route) => {
      const payload = route.request().postDataJSON();
      row = { ...row, ...payload, classification_version: row.classification_version + 1 };
      await route.fulfill({ json: { success: true, data: row } });
    });
    await page.route("**/api/admin/frameworks/77/classification/bulk-review/", async (route) => {
      row = { ...row, classification_review_status: "HUMAN_REVIEWED" };
      await route.fulfill({ json: { success: true, data: { updated_count: 1, results: [row] } } });
    });

    await page.goto("/admin/frameworks/classification?framework=77");
    await expect(page.getByRole("heading", { name: "Indicator Classification" })).toBeVisible();
    await expect(page.getByText("IND-501")).toBeVisible();
    await expect(page.getByRole("button", { name: "Run AI Classification" })).toBeVisible();
    await expect(page.getByRole("combobox").filter({ hasText: "Evidence Type" })).toBeVisible();

    await page.getByRole("button", { name: "Run AI Classification" }).click();
    await expect(page.getByRole("table").getByText("AI Suggested")).toBeVisible();

    await page.locator("tbody select").nth(0).selectOption("PHYSICAL_FACILITY");
    await page.getByRole("button", { name: "Save row" }).click();
    await expect(page.getByRole("table").getByText("Manually Changed")).toBeVisible();

    await page.locator("tbody input[type='checkbox']").check();
    await page.getByRole("button", { name: "Bulk Approve Selected" }).click();
    await expect(page.getByRole("table").getByText("Human Reviewed")).toBeVisible();

    await page.getByRole("button", { name: "Physical / Facility" }).click();
    await expect(page.getByText("IND-501")).toBeVisible();

    await context.close();
  });
});
