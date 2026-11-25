import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { createPasswordResetToken, resetStaffPassword } from "@/lib/store";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; token?: unknown; password?: unknown }
    | null;

  if (typeof body?.token === "string" && typeof body.password === "string") {
    if (body.password.length < 12 || body.password.length > 200) {
      return NextResponse.json(
        { error: "Choose a password with at least 12 characters." },
        { status: 400 },
      );
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const updated = await resetStaffPassword(hashToken(body.token), passwordHash);
    return updated
      ? NextResponse.json({ message: "Your password has been updated. You can now sign in." })
      : NextResponse.json(
          { error: "This password reset link is invalid or has expired. Request a new one." },
          { status: 400 },
        );
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json(
      { error: "Password recovery is not configured yet. Please contact your administrator." },
      { status: 503 },
    );
  }
  const genericMessage = "If an active account matches that email, password reset instructions will be sent.";
  const token = randomBytes(32).toString("base64url");
  const result = await createPasswordResetToken(email, hashToken(token));
  if (result === "sent") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const resetUrl = new URL("/reset-password", siteUrl);
    resetUrl.searchParams.set("token", token);
    try {
      await sendTransactionalEmail({
        to: email,
        subject: "Reset your Rusetat workspace password",
        text: `Use this link within 30 minutes to reset your password: ${resetUrl.toString()}`,
        html: `<p>Use the link below within 30 minutes to reset your Rusetat workspace password.</p><p><a href="${escapeHtml(resetUrl.toString())}">Reset password</a></p><p>If you didn’t request this, you can ignore this email.</p>`,
      });
    } catch (reason) {
      console.error("Password reset email delivery failed.", reason);
    }
  }
  return NextResponse.json({ message: genericMessage });
}
