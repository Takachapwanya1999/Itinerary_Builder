import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { deleteDestination } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const deleted = await deleteDestination(id);
  return deleted
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Destination not found." }, { status: 404 });
}
