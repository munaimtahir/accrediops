import { NextRequest, NextResponse } from "next/server";

type AuthSessionPayload = {
  authenticated: boolean;
  user: {
    id: number;
    role: string;
    username: string;
  } | null;
};

const PROTECTED_PREFIXES = ["/projects", "/project-indicators", "/frameworks", "/admin"];

function normalizeApiOrigin(raw: string) {
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

function getAuthSessionEndpoint(request: NextRequest) {
  const rawOrigin =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    request.nextUrl.origin;
  return `${normalizeApiOrigin(rawOrigin)}/api/auth/session/`;
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function loginRedirectUrl(request: NextRequest) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return redirectUrl;
}

async function readServerSession(request: NextRequest): Promise<AuthSessionPayload | null> {
  if (!request.cookies.get("sessionid")) {
    return null;
  }

  const response = await fetch(getAuthSessionEndpoint(request), {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as { success?: boolean; data?: AuthSessionPayload };
  if (!payload?.success || !payload.data) {
    return null;
  }
  return payload.data;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await readServerSession(request);
  if (!session?.authenticated) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/projects",
    "/projects/:path*",
    "/project-indicators/:path*",
    "/frameworks/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
