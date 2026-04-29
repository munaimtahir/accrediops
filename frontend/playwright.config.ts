import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  globalSetup: "./tests/e2e/global-setup.cjs",
  timeout: 60_000,
  retries: 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "../playwright-report", open: "never" }],
    ["list"],
    ["json", { outputFile: "../OUT/playwright/results.json" }],
  ],
  outputDir: "../OUT/playwright",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:18080",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
});
