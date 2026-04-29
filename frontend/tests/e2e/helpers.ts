import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { APIResponse, expect, Page, Response, TestInfo } from "@playwright/test";

type RoleKey = "admin" | "lead" | "owner" | "reviewer" | "approver";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type FrameworkSummary = {
  id: number;
  name: string;
};

type ProjectSummary = {
  id: number;
  name: string;
  client_name: string;
  framework: number;
  total_indicators: number;
};

type ClientProfile = {
  id: number;
  organization_name: string;
};

type WorklistRow = {
  project_indicator_id: number;
  indicator_code: string;
  current_status: string;
};

const ROLE_USERNAMES: Record<RoleKey, string> = {
  admin: "pw_admin",
  lead: "pw_lead",
  owner: "pw_owner",
  reviewer: "pw_reviewer",
  approver: "pw_approver",
};

const PASSWORD = "x";

export const seededUsers = {
  admin: { username: ROLE_USERNAMES.admin, password: PASSWORD },
  lead: { username: ROLE_USERNAMES.lead, password: PASSWORD },
  owner: { username: ROLE_USERNAMES.owner, password: PASSWORD },
  reviewer: { username: ROLE_USERNAMES.reviewer, password: PASSWORD },
  approver: { username: ROLE_USERNAMES.approver, password: PASSWORD },
} as const;

export const seededUser = {
  frameworkName: "LAB",
} as const;

export const seedContract = {
  clientName: "E2E Lab Client",
  projectName: "E2E Lab Project",
  cloneProjectName: "E2E Lab Project Clone",
  accreditingBodyName: "LAB Accreditation Board",
  artifactPrefix: "E2E_",
} as const;

export function authStatePath(role: RoleKey) {
  return path.resolve(__dirname, ".auth", `${ROLE_USERNAMES[role]}.json`);
}

async function readEnvelope<T>(response: APIResponse, label: string): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok() || !payload.success) {
    throw new Error(`${label} failed (${response.status()}): ${JSON.stringify(payload.error ?? payload)}`);
  }
  return payload.data;
}

async function apiGet<T>(page: Page, url: string, label: string) {
  return readEnvelope<T>(await page.request.get(url), label);
}

async function ensureOriginPage(page: Page) {
  if (page.url().startsWith("http")) {
    return;
  }
  await page.goto("/projects");
}

async function browserRequestRaw(page: Page, url: string, method: "POST" | "PATCH", data: unknown) {
  await ensureOriginPage(page);
  return page.evaluate(
    async ({ targetUrl, targetMethod, payload }) => {
      const csrf = decodeURIComponent(document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)?.[1] ?? "");
      const response = await fetch(targetUrl, {
        method: targetMethod,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify(payload ?? {}),
      });
      const body = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        body,
      };
    },
    { targetUrl: url, targetMethod: method, payload: data },
  );
}

async function browserRequest<T>(page: Page, url: string, method: "POST" | "PATCH", data: unknown, label: string) {
  const result = await browserRequestRaw(page, url, method, data);
  if (!result.ok || !result.body?.success) {
    throw new Error(`${label} failed (${result.status}): ${JSON.stringify(result.body?.error ?? result.body)}`);
  }
  return result.body.data as T;
}

async function apiPost<T>(page: Page, url: string, data: unknown, label: string) {
  return browserRequest<T>(page, url, "POST", data, label);
}

async function apiPatch<T>(page: Page, url: string, data: unknown, label: string) {
  return browserRequest<T>(page, url, "PATCH", data, label);
}

export async function getApi<T>(page: Page, url: string, label: string) {
  return apiGet<T>(page, url, label);
}

export async function postApi<T>(page: Page, url: string, data: unknown, label: string) {
  return apiPost<T>(page, url, data, label);
}

export async function postApiRaw(page: Page, url: string, data: unknown) {
  return browserRequestRaw(page, url, "POST", data);
}

export async function loginAs(page: Page, role: RoleKey) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(ROLE_USERNAMES[role]);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/projects/);
}

export async function login(page: Page, user: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/projects/);
}

export async function loginAsSeededAdmin(page: Page) {
  await login(page, seededUsers.admin);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function ensureE2EClient(page: Page) {
  const clients = await apiGet<ClientProfile[]>(page, "/api/client-profiles/", "list client profiles");
  const existing = clients.find((item) => item.organization_name === seedContract.clientName);
  if (existing) {
    return existing;
  }
  return apiPost<ClientProfile>(
    page,
    "/api/client-profiles/",
    {
      organization_name: seedContract.clientName,
      address: "E2E Lab Address",
      license_number: "E2E-LAB-LIC",
      registration_number: "E2E-LAB-REG",
      contact_person: "E2E Operator",
      department_names: ["Quality", "Compliance"],
    },
    "create e2e client",
  );
}

async function getLabFrameworkId(page: Page) {
  const frameworks = await apiGet<FrameworkSummary[]>(page, "/api/frameworks/", "list frameworks");
  const lab = frameworks.find((item) => item.name === "LAB");
  if (!lab) {
    throw new Error("LAB framework not found.");
  }
  return lab.id;
}

export async function ensureE2EProjectFromLab(page: Page) {
  const client = await ensureE2EClient(page);
  const frameworkId = await getLabFrameworkId(page);
  const projects = await apiGet<{ count: number; results: ProjectSummary[] }>(
    page,
    "/api/projects/?page_size=all",
    "list projects",
  );
  let project = projects.results.find((item) => item.name === seedContract.projectName);
  if (!project) {
    project = await apiPost<ProjectSummary>(
      page,
      "/api/projects/",
      {
        name: seedContract.projectName,
        client_name: seedContract.clientName,
        accrediting_body_name: seedContract.accreditingBodyName,
        framework: frameworkId,
        client_profile: client.id,
        start_date: new Date().toISOString().slice(0, 10),
        target_date: new Date(Date.now() + 86400000 * 120).toISOString().slice(0, 10),
        notes: "Deterministic Playwright baseline project",
      },
      "create e2e project",
    );
  } else if (project.framework !== frameworkId) {
    project = await apiPatch<ProjectSummary>(
      page,
      `/api/projects/${project.id}/`,
      {
        framework: frameworkId,
        client_name: seedContract.clientName,
        accrediting_body_name: seedContract.accreditingBodyName,
      },
      "patch e2e project",
    );
  }
  await apiPost(
    page,
    `/api/projects/${project.id}/initialize-from-framework/`,
    { create_initial_instances: true },
    "initialize e2e project",
  );
  return project;
}

export async function ensureCleanE2EState(page: Page) {
  return createProjectFromLab(
    page,
    `${seedContract.artifactPrefix}RUN_${Date.now()}`,
    `${seedContract.artifactPrefix}CLIENT_${Date.now()}`,
  );
}

export async function listProjects(page: Page) {
  return apiGet<{ count: number; results: ProjectSummary[] }>(page, "/api/projects/?page_size=all", "list projects");
}

export async function createProjectFromLab(page: Page, projectName: string, clientName: string) {
  const frameworkId = await getLabFrameworkId(page);
  const project = await apiPost<ProjectSummary>(
    page,
    "/api/projects/",
    {
      name: projectName,
      client_name: clientName,
      accrediting_body_name: seedContract.accreditingBodyName,
      framework: frameworkId,
      start_date: new Date().toISOString().slice(0, 10),
      target_date: new Date(Date.now() + 86400000 * 120).toISOString().slice(0, 10),
      notes: "Playwright deterministic project",
    },
    "create project from lab",
  );
  await apiPost(
    page,
    `/api/projects/${project.id}/initialize-from-framework/`,
    { create_initial_instances: true },
    "initialize created project",
  );
  return project;
}

export async function openProjectByName(page: Page, projectName: string) {
  const projects = await apiGet<{ count: number; results: ProjectSummary[] }>(
    page,
    "/api/projects/?page_size=all",
    "list projects for open",
  );
  const project = projects.results.find((item) => item.name === projectName);
  if (!project) {
    throw new Error(`Project not found: ${projectName}`);
  }
  await page.goto(`/projects/${project.id}`);
  await expect(page).toHaveURL(new RegExp(`/projects/${project.id}$`));
  return project.id;
}

export async function openWorklist(page: Page, projectId: number) {
  await page.goto(`/projects/${projectId}/worklist`);
  await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
}

export async function getWorklistRows(page: Page, projectId: number, query = "page_size=25") {
  return apiGet<{ count: number; results: WorklistRow[] }>(
    page,
    `/api/dashboard/worklist/?project_id=${projectId}&${query}`,
    "get worklist rows",
  );
}

export async function getFirstIndicatorId(page: Page, projectId: number) {
  const payload = await getWorklistRows(page, projectId, "page_size=1");
  const indicatorId = payload.results[0]?.project_indicator_id;
  if (!indicatorId) {
    throw new Error("No worklist indicators available.");
  }
  return indicatorId;
}

export function expectNo5xxOnPage(page: Page) {
  const failures: string[] = [];
  const handler = (response: Response) => {
    if (response.status() >= 500) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  };
  page.on("response", handler);
  return async () => {
    page.off("response", handler);
    expect(failures, `Unexpected 5xx responses:\n${failures.join("\n")}`).toEqual([]);
  };
}

export async function collectFailureEvidence(
  page: Page,
  testInfo: TestInfo,
  label: string,
  detail: Record<string, unknown>,
) {
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const screenshotPath = testInfo.outputPath(`${safeLabel}.png`);
  const jsonPath = testInfo.outputPath(`${safeLabel}.json`);
  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        url: page.url(),
        detail,
      },
      null,
      2,
    ),
    "utf8",
  );
  await testInfo.attach(`${label}-json`, { path: jsonPath, contentType: "application/json" });
  await testInfo.attach(`${label}-screenshot`, { path: screenshotPath, contentType: "image/png" });
}
