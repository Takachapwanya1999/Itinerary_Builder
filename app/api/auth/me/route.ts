import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
