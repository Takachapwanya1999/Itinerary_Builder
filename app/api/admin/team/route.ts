import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { createStaffUser, getStaffUsers } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request, ["admin"]);
  if ("response" in auth) return auth.response;
  return NextResponse.json(await getStaffUsers());
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request, ["admin"]);
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown; password?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: "Choose a temporary password with at least 12 characters." }, { status: 400 });
  }

  const user = await createStaffUser({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "consultant",
  });
  if (!user) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }
  return NextResponse.json(user, { status: 201 });
}
