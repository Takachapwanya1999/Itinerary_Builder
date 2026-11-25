import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { updateStaffProfile } from "@/lib/store";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
  }
  const user = await updateStaffProfile(auth.user.id, name);
  if (!user) return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
