import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, getWorklistRows, postApi } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("07 review and approval lifecycle", () => {
  test("start -> review -> met flow works and invalid transition is blocked", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const nonRecurringRows = await getWorklistRows(page, project.id, "recurring=false&page_size=1");
    const indicatorId = nonRecurringRows.results[0]?.project_indicator_id;
    expect(indicatorId).toBeTruthy();
    if (!indicatorId) {
      throw new Error("No non-recurring indicator available for approval lifecycle test.");
    }

    const detailBefore = await getApi<{
      project_evidence_requirements: Array<{ id: number }>;
      indicator: { minimum_required_evidence_count: number };
    }>(page, `/api/project-indicators/${indicatorId}/`, "get indicator readiness baseline");
    
    const requirements = detailBefore.project_evidence_requirements || [];
    const requiredEvidenceCount = Math.max(detailBefore.indicator.minimum_required_evidence_count, requirements.length, 1);

    await postApi(page, `/api/project-indicators/${indicatorId}/start/`, { reason: "E2E start" }, "start indicator");

    // Loop through explicit requirements first
    for (const req of requirements) {
      const evidence = await postApi<{ id: number }>(
        page,
        "/api/evidence/",
        {
          project_indicator_id: indicatorId,
          project_evidence_requirement_id: req.id,
          title: `E2E_REVIEW_REQ_${req.id}_${Date.now()}`,
          source_type: "TEXT_NOTE",
          text_content: `Evidence for requirement ${req.id}`,
        },
        "create review evidence for requirement",
      );

      await postApi(
        page,
        `/api/evidence/${evidence.id}/review/`,
        {
          validity_status: "VALID",
          completeness_status: "COMPLETE",
          approval_status: "APPROVED",
          review_notes: "Workflow review",
        },
        "review evidence",
      );
    }

    // If more evidence is needed to meet the minimum count, add generic ones
    const genericNeeded = requiredEvidenceCount - requirements.length;
    for (let index = 0; index < genericNeeded; index += 1) {
      const evidence = await postApi<{ id: number }>(
        page,
        "/api/evidence/",
        {
          project_indicator_id: indicatorId,
          title: `E2E_REVIEW_GENERIC_${Date.now()}_${index}`,
          source_type: "TEXT_NOTE",
          text_content: `Generic evidence ${index}`,
        },
        "create generic review evidence",
      );

      await postApi(
        page,
        `/api/evidence/${evidence.id}/review/`,
        {
          validity_status: "VALID",
          completeness_status: "COMPLETE",
          approval_status: "APPROVED",
          review_notes: "Workflow review",
        },
        "review evidence",
      );
    }

    await postApi(
      page,
      `/api/project-indicators/${indicatorId}/send-for-review/`,
      { reason: "E2E send for review" },
      "send indicator for review",
    );

    await postApi(
      page,
      `/api/project-indicators/${indicatorId}/mark-met/`,
      { reason: "E2E mark met" },
      "mark indicator met",
    );

    const detail = await getApi<{ current_status: string; is_met: boolean }>(
      page,
      `/api/project-indicators/${indicatorId}/`,
      "get indicator detail",
    );
    expect(detail.current_status).toBe("MET");
    expect(detail.is_met).toBeTruthy();

    const invalidTransitionStatus = await page.evaluate(async (targetIndicatorId) => {
      const csrf = decodeURIComponent(document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)?.[1] ?? "");
      const response = await fetch(`/api/project-indicators/${targetIndicatorId}/send-for-review/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({ reason: "Should fail from MET" }),
      });
      return response.status;
    }, indicatorId);
    expect(invalidTransitionStatus).toBe(400);
  });
});
