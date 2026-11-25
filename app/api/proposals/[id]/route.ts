import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { getProposal, updateProposalStatus } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  if (proposal.status === "Draft") {
    const auth = await requireStaff(request);
    if ("response" in auth) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }
  const { clientEmail, clientPhone, budget, ...publicProposal } = proposal;
  return NextResponse.json(publicProposal, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { status?: string; feedback?: string }
    | null;
  const statuses: ProposalStatus[] = ["Draft", "Sent", "Approved", "Changes Requested", "Declined"];
  if (!body?.status || !statuses.includes(body.status as ProposalStatus)) {
    return NextResponse.json({ error: "A valid proposal status is required." }, { status: 400 });
  }
  const clientAction = ["Approved", "Changes Requested", "Declined"].includes(body.status);
  if (!clientAction) {
    const auth = await requireStaff(request);
    if ("response" in auth) return auth.response;
  }
  const feedback = typeof body.feedback === "string" ? body.feedback.trim() : undefined;
  if (feedback && feedback.length > 2000) {
    return NextResponse.json({ error: "Feedback must be 2,000 characters or fewer." }, { status: 400 });
  }
  if (body.status === "Changes Requested" && !feedback) {
    return NextResponse.json({ error: "Please describe the changes you would like." }, { status: 400 });
  }
  const proposal = await updateProposalStatus(id, body.status as ProposalStatus, feedback);
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  const { clientEmail, clientPhone, budget, ...publicProposal } = proposal;
  let notificationError: string | undefined;
  if (clientAction && proposal.consultantEmail) {
    try {
      await sendTransactionalEmail({
        to: proposal.consultantEmail,
        subject: `Client ${body.status.toLowerCase()} a travel proposal`,
        text: `${proposal.clientName} ${body.status.toLowerCase()} the proposal for ${proposal.destinations.map((destination) => destination.name).join(", ")}.${feedback ? `\n\nFeedback:\n${feedback}` : ""}`,
        html: `<p>${escapeHtml(proposal.clientName)} ${escapeHtml(body.status.toLowerCase())} your proposal for ${escapeHtml(proposal.destinations.map((destination) => destination.name).join(", "))}.</p>${feedback ? `<p><strong>Feedback:</strong><br>${escapeHtml(feedback).replace(/\n/g, "<br>")}</p>` : ""}`,
      });
    } catch (reason) {
      console.error("Proposal response notification failed.", reason);
      notificationError = "Your response was recorded, but the consultant notification email could not be sent.";
    }
  }
  return NextResponse.json({ proposal: publicProposal, notificationError }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

type ProposalStatus = import("@/lib/types").Proposal["status"];

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
