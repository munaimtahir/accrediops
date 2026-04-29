const { execFileSync } = require("node:child_process");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { URL } = require("node:url");
const { chromium } = require("@playwright/test");

const DEFAULT_BASE_URL = "http://127.0.0.1:18080";
const PASSWORD = "x";
const AUTH_DIR = resolve(__dirname, ".auth");
const ROLE_USERNAMES = ["pw_admin", "pw_lead", "pw_owner", "pw_reviewer", "pw_approver"];

function runDeterministicSeed(baseUrl) {
  const repoRoot = resolve(__dirname, "../../..");
  const backendDir = resolve(repoRoot, "backend");
  const venvPython = resolve(backendDir, ".venv/bin/python");
  const pythonBinary = existsSync(venvPython) ? venvPython : "python3";
  const host = new URL(baseUrl).hostname || "127.0.0.1";

  execFileSync(
    pythonBinary,
    [
      "manage.py",
      "seed_e2e_state",
      "--password",
      PASSWORD,
      "--clean-e2e-records",
      "--ensure-client",
      "--ensure-project",
      "--initialize-project",
    ],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        DJANGO_ALLOWED_HOSTS: [process.env.DJANGO_ALLOWED_HOSTS || "", host, "localhost", "127.0.0.1"]
          .filter(Boolean)
          .join(","),
      },
      stdio: "pipe",
    },
  );
}

async function buildRoleStorageStates(baseUrl) {
  mkdirSync(AUTH_DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const username of ROLE_USERNAMES) {
      const context = await browser.newContext({ baseURL: baseUrl });
      const page = await context.newPage();
      await page.goto("/login");
      
      // Wait for hydration/loading to finish
      await page.waitForSelector("#username-input", { state: "visible", timeout: 20000 });
      
      await page.fill("#username-input", username);
      await page.fill("#password-input", PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/projects/);
      const storageState = await context.storageState();
      const normalized = {
        ...storageState,
        cookies: storageState.cookies.map((cookie) => ({
          ...cookie,
          secure: false,
        })),
      };
      writeFileSync(resolve(AUTH_DIR, `${username}.json`), JSON.stringify(normalized, null, 2));
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

module.exports = async () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || DEFAULT_BASE_URL;
  runDeterministicSeed(baseUrl);
  await buildRoleStorageStates(baseUrl);
};
