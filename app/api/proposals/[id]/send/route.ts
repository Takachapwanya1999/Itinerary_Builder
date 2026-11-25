import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { getProposal, updateProposalStatus } from "@/lib/store";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  if (proposal.status === "Approved") {
    return NextResponse.json({ error: "An approved proposal cannot be sent again." }, { status: 409 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const proposalUrl = new URL(`/itinerary/${encodeURIComponent(id)}`, siteUrl).toString();
  const destinations = proposal.destinations.map((destination) => destination.name).join(", ");
  const clientName = escapeHtml(proposal.clientName);
  const destinationList = escapeHtml(destinations);
  const safeUrl = escapeHtml(proposalUrl);
  try {
    await sendTransactionalEmail({
      to: proposal.clientEmail,
      replyTo: auth.user.email,
      subject: `Your ${destinations || "travel"} proposal from Rusetat`,
      text: `Hello ${proposal.clientName},\n\nYour travel proposal is ready to review: ${proposalUrl}\n\nWarm regards,\nRusetat Migration & Travel International`,
      html: `<div style="font-family:Arial,sans-serif;color:#172238;line-height:1.6"><h1 style="font-family:Georgia,serif">Your journey is ready</h1><p>Hello ${clientName},</p><p>Your thoughtfully planned journey${destinationList ? ` to ${destinationList}` : ""} is ready to review.</p><p><a href="${safeUrl}" style="display:inline-block;background:#111c31;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">View your proposal</a></p><p>Warm regards,<br>Rusetat Migration &amp; Travel International</p></div>`,
    });
  } catch (reason) {
    console.error("Proposal email delivery failed.", reason);
    return NextResponse.json(
      { error: reason instanceof Error ? reason.message : "Unable to deliver proposal email." },
      { status: 502 },
    );
  }

  const sentProposal = await updateProposalStatus(id, "Sent");
  if (!sentProposal) {
    return NextResponse.json(
      { error: "The email was sent, but the proposal status could not be updated." },
      { status: 500 },
    );
  }
  return NextResponse.json({ status: sentProposal.status });
}
