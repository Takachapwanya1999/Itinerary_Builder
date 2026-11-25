import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getStaffUserForLogin, updateStaffPassword } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => null)) as
    | { currentPassword?: unknown; newPassword?: unknown }
    | null;
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 12 || newPassword.length > 200) {
    return NextResponse.json(
      { error: "Choose a password with at least 12 characters." },
      { status: 400 },
    );
  }
  const user = await getStaffUserForLogin(auth.user.email);
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await updateStaffPassword(auth.user.id, passwordHash);
  if (!updated) return NextResponse.json({ error: "Unable to update password." }, { status: 500 });
  return NextResponse.json({ message: "Password updated." }, { headers: { "Cache-Control": "no-store" } });
}
