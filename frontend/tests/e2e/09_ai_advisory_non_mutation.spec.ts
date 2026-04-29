import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, getFirstIndicatorId, postApi } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("09 ai advisory non-mutation", () => {
  test("AI output can be generated and accepted without mutating workflow status", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);

    const beforeDetail = await getApi<{ current_status: string }>(
      page,
      `/api/project-indicators/${indicatorId}/`,
      "get indicator before ai",
    );
    const beforeStatus = beforeDetail.current_status;

    const generated = await postApi<{ id: number }>(
      page,
      "/api/ai/generate/",
      {
        project_indicator_id: indicatorId,
        output_type: "GUIDANCE",
        user_instruction: "Generate operator guidance",
      },
      "generate ai guidance",
    );

    await postApi(page, `/api/ai/outputs/${generated.id}/accept/`, {}, "accept ai output");

    const afterDetail = await getApi<{ current_status: string }>(
      page,
      `/api/project-indicators/${indicatorId}/`,
      "get indicator after ai",
    );
    expect(afterDetail.current_status).toBe(beforeStatus);

    await page.goto(`/project-indicators/${indicatorId}`);
    await page.getByRole("button", { name: "AI / Assist", exact: true }).click();
    await expect(page.getByText("Section 7 — AI / Assist")).toBeVisible();
    await expect(page.getByText("AI-generated").first()).toBeVisible();
  });
});
