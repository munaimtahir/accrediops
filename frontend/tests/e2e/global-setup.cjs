const { execFileSync } = require("node:child_process");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { URL } = require("node:url");
const { chromium } = require("@playwright/test");

const DEFAULT_BASE_URL = "http://127.0.0.1:18080";
const PASSWORD = "x";
const AUTH_DIR = resolve(__dirname, ".auth");
const ROLE_USERNAMES = ["pw_admin", "pw_lead", "pw_owner", "pw_reviewer", "pw_approver"];

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function isDatabaseLockedError(error) {
  if (!error) return false;
  const stderr = typeof error.stderr === "string" ? error.stderr : error.stderr?.toString?.("utf8") || "";
  const stdout = typeof error.stdout === "string" ? error.stdout : error.stdout?.toString?.("utf8") || "";
  const message = `${error.message || ""}\n${stderr}\n${stdout}`;
  return /database is locked/i.test(message);
}

async function execFileSyncWithRetries(binary, args, options) {
  const retries = Number(process.env.E2E_SEED_RETRIES || 5);
  const baseDelayMs = Number(process.env.E2E_SEED_RETRY_DELAY_MS || 250);

  let attempt = 0;
  while (true) {
    try {
      execFileSync(binary, args, options);
      return;
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !isDatabaseLockedError(error)) {
        throw error;
      }
      // Exponential-ish backoff: 250ms, 500ms, 1s, 2s...
      // Keep it short; this is only to smooth out sqlite write locks.
      await sleep(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }
}

function runDeterministicSeed(baseUrl) {
  const repoRoot = resolve(__dirname, "../../..");
  const backendDir = resolve(repoRoot, "backend");
  const venvPython = resolve(backendDir, ".venv/bin/python");
  const pythonBinary = existsSync(venvPython) ? venvPython : "python3";
  const host = new URL(baseUrl).hostname || "127.0.0.1";

  const seedArgs = [
    "manage.py",
    "seed_e2e_state",
    "--password",
    PASSWORD,
    "--clean-e2e-records",
    "--ensure-client",
    "--ensure-project",
    "--initialize-project",
  ];

  // Prefer running seed inside docker-compose backend to avoid sqlite permission mismatches
  // between host UID/GID and container-created `backend/db.sqlite3`.
  // Fallback to host python if docker compose is unavailable.
  const dockerArgs = ["compose", "exec", "-T", "backend", "python", ...seedArgs];
  try {
    return execFileSyncWithRetries("docker", dockerArgs, { cwd: repoRoot, stdio: "pipe", env: process.env });
  } catch {
    // Retry seeding because sqlite can be briefly locked by concurrent DB access.
    return execFileSyncWithRetries(pythonBinary, seedArgs, {
      cwd: backendDir,
      env: {
        ...process.env,
        DJANGO_ALLOWED_HOSTS: [process.env.DJANGO_ALLOWED_HOSTS || "", host, "localhost", "127.0.0.1"]
          .filter(Boolean)
          .join(","),
      },
      stdio: "pipe",
    }).catch(async () => {
      // If the host seed fails, try docker compose again with retries as a last resort.
      // (Some environments may have transient compose readiness issues.)
      await execFileSyncWithRetries("docker", dockerArgs, { cwd: repoRoot, stdio: "pipe", env: process.env });
      return;
    });
  }
}

async function buildRoleStorageStates(baseUrl) {
  mkdirSync(AUTH_DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const username of ROLE_USERNAMES) {
      const context = await browser.newContext({ baseURL: baseUrl });
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.goto("/login", { waitUntil: "commit", timeout: 60000 });

      // Deterministic, cookie-persisting auth via Playwright API requests.
      await page.request.get("/api/auth/session/");
      const csrfToken = (await context.cookies()).find((cookie) => cookie.name === "csrftoken")?.value;
      if (!csrfToken) {
        throw new Error(`Missing csrftoken cookie for storageState user=${username}`);
      }
      const loginResponse = await page.request.post("/api/auth/login/", {
        data: { username, password: PASSWORD },
        headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
      });
      const loginPayload = await loginResponse.json().catch(() => null);
      if (!loginResponse.ok() || !loginPayload?.success) {
        throw new Error(`API login failed for storageState user=${username}: ${JSON.stringify(loginPayload)}`);
      }
      await page.request.get("/api/auth/session/");

      await page.goto("/projects", { waitUntil: "commit", timeout: 60000 });

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
  await runDeterministicSeed(baseUrl);
  await buildRoleStorageStates(baseUrl);
};
