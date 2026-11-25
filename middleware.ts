import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const publicPaths = ["/signin", "/setup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPath = publicPaths.includes(pathname);
  const isAuthApi =
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/me" ||
    pathname === "/api/auth/setup" ||
    pathname === "/api/auth/password-reset";
  const isPublicCatalogPath =
    pathname === "/destinations" || pathname.startsWith("/destinations/");
  const isPublicProposalApi =
    /^\/api\/proposals\/[^/]+$/.test(pathname) &&
    (request.method === "GET" || request.method === "PATCH");
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionToken(token) : undefined;

  if (isPublicPath) {
    if (claims) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  if (isAuthApi || isPublicProposalApi || isPublicCatalogPath || pathname === "/api/inquiries") {
    return NextResponse.next();
  }

  if (!claims) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  if (
    (pathname === "/admin/team" || pathname.startsWith("/api/admin/team")) &&
    claims.role !== "admin"
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|rusetat-logo.png|great-zimbabwe.png).*)"],
};
