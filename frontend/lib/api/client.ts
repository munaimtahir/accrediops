import {
  ApiErrorEnvelope,
  ApiErrorPayload,
  ApiSuccessEnvelope,
  PaginatedResult,
} from "@/types";
import { compactObject } from "@/utils/query";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiClientError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(message: string, options: { code: string; status: number; details: unknown }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

function buildUrl(path: string, params?: object) {
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute
    ? new URL(path)
    : DEFAULT_API_BASE_URL
      ? new URL(path, DEFAULT_API_BASE_URL)
      : new URL(path, "http://local-proxy");

  if (params) {
    const compacted = compactObject(params as Record<string, unknown>);
    for (const [key, value] of Object.entries(compacted)) {
      if (typeof value === "boolean") {
        url.searchParams.set(key, String(value));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  if (!isAbsolute && !DEFAULT_API_BASE_URL) {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}

function getCsrfToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const errorEnvelope = body as ApiErrorEnvelope | null;
    const error: ApiErrorPayload | undefined = errorEnvelope?.error;
    throw new ApiClientError(error?.message ?? "Request failed.", {
      code: error?.code ?? "API_ERROR",
      status: response.status,
      details: error?.details ?? body,
    });
  }

  const successEnvelope = body as ApiSuccessEnvelope<T> | null;
  if (!successEnvelope?.success) {
    throw new ApiClientError("Malformed API response.", {
      code: "MALFORMED_RESPONSE",
      status: response.status,
      details: body,
    });
  }

  return successEnvelope.data;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  params?: object,
): Promise<T> {
  const method = init.method ?? "GET";
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD"].includes(method.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers,
    credentials: "include",
  });

  return parseResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, params?: object) => request<T>(path, { method: "GET" }, params),
  post: <T>(path: string, body?: unknown, params?: object) =>
    request<T>(
      path,
      {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      },
      params,
    ),
  patch: <T>(path: string, body?: unknown, params?: object) =>
    request<T>(
      path,
      {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      },
      params,
    ),
};

export function isPaginatedResult<T>(value: T | PaginatedResult<unknown>): value is PaginatedResult<unknown> {
  return typeof value === "object" && value !== null && "results" in value && "count" in value;
}

export function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed.";
}
