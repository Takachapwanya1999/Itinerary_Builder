import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { updateStaffUserActive } from "@/lib/store";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaff(request, ["admin"]);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  if (id === auth.user.id) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as { isActive?: unknown } | null;
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "Choose whether this account should be active." }, { status: 400 });
  }
  const user = await updateStaffUserActive(id, body.isActive);
  return user
    ? NextResponse.json(user)
    : NextResponse.json({ error: "Account not found or protected." }, { status: 404 });
}
