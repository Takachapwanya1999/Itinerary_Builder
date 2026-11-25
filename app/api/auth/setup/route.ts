import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  createInitialAdmin,
  getStaffUserCount,
} from "@/lib/store";
import { createSessionToken, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const setupRequired = (await getStaffUserCount()) === 0;
  return NextResponse.json({ setupRequired }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown; password?: unknown; setupKey?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const setupKey = typeof body?.setupKey === "string" ? body.setupKey : "";
  const configuredSetupKey = process.env.INITIAL_SETUP_KEY;
  const submittedKey = Buffer.from(setupKey);
  const expectedKey = Buffer.from(configuredSetupKey ?? "");
  const setupKeyValid =
    configuredSetupKey !== undefined &&
    submittedKey.length === expectedKey.length &&
    timingSafeEqual(submittedKey, expectedKey);

  if (!setupKeyValid) {
    return NextResponse.json({ error: "The initial setup key is invalid." }, { status: 401 });
  }

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: "Choose a password with at least 12 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createInitialAdmin({ name, email, passwordHash });
  if (!user) {
    return NextResponse.json(
      { error: "Initial setup has already been completed. Please sign in." },
      { status: 409 },
    );
  }

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
