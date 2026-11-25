import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { claimPublicInquiry } from "@/lib/store";

export const runtime = "nodejs";

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
    | { name?: unknown; email?: unknown; destination?: unknown; message?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const destination = typeof body?.destination === "string" ? body.destination.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (
    name.length < 2 || name.length > 100 ||
    email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    destination.length > 120 || message.length < 10 || message.length > 3000
  ) {
    return NextResponse.json({ error: "Please check your details and inquiry message." }, { status: 400 });
  }
  const contactEmail = process.env.CONTACT_EMAIL;
  if (!contactEmail) {
    return NextResponse.json({ error: "The inquiry form is not available yet. Please try again later." }, { status: 503 });
  }
  const clientIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const ipHash = createHash("sha256").update(clientIp).digest("hex");
  if (!(await claimPublicInquiry(ipHash))) {
    return NextResponse.json({ error: "Too many inquiries from this connection. Please try again later." }, { status: 429 });
  }

  try {
    await sendTransactionalEmail({
      to: contactEmail,
      replyTo: email,
      subject: `New travel inquiry${destination ? `: ${destination}` : ""}`,
      text: `From: ${name} <${email}>\nDestination: ${destination || "Not specified"}\n\n${message}`,
      html: `<h2>New travel inquiry</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p><strong>Destination:</strong> ${escapeHtml(destination || "Not specified")}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
  } catch (reason) {
    console.error("Destination inquiry email delivery failed.", reason);
    return NextResponse.json({ error: "Unable to deliver your inquiry right now. Please try again later." }, { status: 502 });
  }
  return NextResponse.json({ message: "Thanks for getting in touch. A travel consultant will reply soon." });
}
