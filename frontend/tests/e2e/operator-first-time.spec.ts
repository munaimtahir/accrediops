import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, getFirstIndicatorId, loginAs, postApi } from "./helpers";

test.describe("operator first time", () => {
  test.use({ storageState: authStatePath("admin") });

  test("first-time operator journey stays explicit across create, evidence, review, and approval", async ({ page }) => {
    await page.goto("/projects");
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);

    const owner = (await getApi<Array<{ id: number }>>(page, "/api/users/?role=OWNER", "load owners"))[0];
    const reviewer = (await getApi<Array<{ id: number }>>(page, "/api/users/?role=REVIEWER", "load reviewers"))[0];
    const approver = (await getApi<Array<{ id: number }>>(page, "/api/users/?role=APPROVER", "load approvers"))[0];

    await postApi(
      page,
      `/api/project-indicators/${indicatorId}/assign/`,
      {
        owner_id: owner.id,
        reviewer_id: reviewer.id,
        approver_id: approver.id,
        priority: "HIGH",
      },
      "assign first indicator",
    );

    await page.goto(`/projects/${project.id}`);
    await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to worklist" })).toBeVisible();

    await page.context().clearCookies();
    await loginAs(page, "owner");
    await page.goto(`/project-indicators/${indicatorId}`);
    const ownerNextAction = page.getByTestId("next-action-banner");
    await expect(ownerNextAction.getByText("Action", { exact: true })).toBeVisible();
    await expect(ownerNextAction.getByText("Start the indicator, then add evidence.")).toBeVisible();

    const firstEvidence = await postApi<{ id: number }>(
      page,
      "/api/evidence/",
      {
        project_indicator_id: indicatorId,
        title: "First-time operator evidence 1",
        description: "Operator guidance test evidence 1",
        source_type: "TEXT_NOTE",
        text_content: "Evidence prepared from the guided workflow.",
      },
      "owner add evidence",
    );
    const secondEvidence = await postApi<{ id: number }>(
      page,
      "/api/evidence/",
      {
        project_indicator_id: indicatorId,
        title: "First-time operator evidence 2",
        description: "Operator guidance test evidence 2",
        source_type: "TEXT_NOTE",
        text_content: "Second required evidence item prepared from the guided workflow.",
      },
      "owner add second evidence",
    );
    await postApi(page, `/api/project-indicators/${indicatorId}/start/`, { reason: "Owner started guided flow" }, "owner start indicator");
    await postApi(
      page,
      `/api/project-indicators/${indicatorId}/send-for-review/`,
      { reason: "Owner completed guided evidence submission" },
      "owner send for review",
    );

    await page.context().clearCookies();
    await loginAs(page, "reviewer");
    await page.goto(`/project-indicators/${indicatorId}`);
    await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();
    for (const evidence of [firstEvidence, secondEvidence]) {
      await postApi(
        page,
        `/api/evidence/${evidence.id}/review/`,
        {
          validity_status: "VALID",
          completeness_status: "COMPLETE",
          approval_status: "APPROVED",
          review_notes: "Reviewed through guided operator flow.",
        },
        "reviewer approve evidence",
      );
    }

    await page.context().clearCookies();
    await loginAs(page, "approver");
    await page.goto(`/project-indicators/${indicatorId}`);
    await expect(page.getByTestId("next-action-banner").getByText("Approver can mark this indicator as met.")).toBeVisible();
    await page.getByRole("button", { name: "Actions", exact: true }).click();
    await expect(page.getByRole("button", { name: "Approve (Mark as Met)" })).toBeVisible();
    await postApi(
      page,
      `/api/project-indicators/${indicatorId}/mark-met/`,
      { reason: "Approver completed guided operator flow" },
      "approver mark met",
    );

    await page.reload();
    await expect(
      page
        .getByTestId("next-action-banner")
        .getByText("Indicator is already completed. Use Return or Reopen only when a governance override is required."),
    ).toBeVisible();
  });
});
