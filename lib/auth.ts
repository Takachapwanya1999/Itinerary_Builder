import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getActiveStaffUser } from "@/lib/store";
import type { StaffUser } from "@/lib/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
export { createSessionToken, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/session";

export async function getRequestUser(request: NextRequest): Promise<StaffUser | undefined> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return undefined;
  const claims = await verifySessionToken(token);
  if (!claims) return undefined;
  const user = await getActiveStaffUser(claims.sub);
  if (!user || user.role !== claims.role) return undefined;
  return user;
}

export async function requireStaff(
  request: NextRequest,
  roles?: StaffUser["role"][],
): Promise<{ user: StaffUser } | { response: NextResponse }> {
  const user = await getRequestUser(request);
  if (!user) {
    return {
      response: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }),
    };
  }
  if (roles && !roles.includes(user.role)) {
    return {
      response: NextResponse.json({ error: "You don't have permission to do that." }, { status: 403 }),
    };
  }
  return { user };
}
