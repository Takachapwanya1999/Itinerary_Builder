import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  clearLoginFailures,
  getStaffUserForLogin,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/store";
import { createSessionToken, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/session";

export const runtime = "nodejs";

const dummyPasswordHash = bcrypt.hash(randomUUID(), 12);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length > 2000) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  if (await isLoginLocked(email)) {
    return NextResponse.json(
      { error: "Too many unsuccessful attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const user = await getStaffUserForLogin(email);
  const passwordHash = user?.passwordHash ?? (await dummyPasswordHash);
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!user || !user.isActive || !passwordMatches) {
    await recordLoginFailure(email);
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  await clearLoginFailures(email);
  const token = await createSessionToken(user);
  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
