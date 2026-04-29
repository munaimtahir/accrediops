import { expect, test } from "@playwright/test";

import {
  authStatePath,
  collectFailureEvidence,
  ensureCleanE2EState,
  getFirstIndicatorId,
} from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("14 regression 500s and console errors", () => {
  test("high-risk routes do not emit pageerror/console.error/requestfailed/5xx", async ({ page }, testInfo) => {
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);

    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];
    const serverErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("requestfailed", (request) => {
      if (request.url().includes("/api/")) {
        const errorText = request.failure()?.errorText ?? "failed";
        if (errorText.includes("ERR_ABORTED")) {
          return;
        }
        requestFailures.push(`${errorText} ${request.url()}`);
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/projects");
    await page.goto(`/projects/${project.id}`);
    await page.goto(`/projects/${project.id}/worklist?page_size=all`);
    await page.goto(`/project-indicators/${indicatorId}`);
    await page.goto("/admin");
    await page.goto("/admin/import-logs");

    const failures = {
      pageErrors,
      consoleErrors,
      requestFailures,
      serverErrors,
    };

    if (pageErrors.length || consoleErrors.length || requestFailures.length || serverErrors.length) {
      await collectFailureEvidence(page, testInfo, "regression-signals", failures);
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
    expect(serverErrors).toEqual([]);
  });
});
