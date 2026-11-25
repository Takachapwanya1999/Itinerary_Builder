import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getProposals, saveProposal } from "@/lib/store";
import type { Proposal } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  return NextResponse.json(await getProposals());
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const body = (await request.json()) as Partial<Proposal>;
  if (
    !body.clientName ||
    !body.clientEmail ||
    !body.startDate ||
    !body.endDate ||
    !body.destinations?.length
  ) {
    return NextResponse.json(
      { error: "Client details, travel dates, and a destination are required." },
      { status: 400 },
    );
  }
  const validStatuses: Proposal["status"][] = [
    "Draft",
    "Sent",
    "Approved",
    "Changes Requested",
    "Declined",
  ];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "A valid proposal status is required." }, { status: 400 });
  }
  const proposal = await saveProposal({
    clientName: body.clientName,
    clientEmail: body.clientEmail,
    clientPhone: body.clientPhone ?? "",
    consultantEmail: auth.user.email,
    startDate: body.startDate,
    endDate: body.endDate,
    passengers: body.passengers ?? 1,
    budget: body.budget,
    totalPrice: body.totalPrice ?? 0,
    currency: body.currency ?? "USD",
    destinations: body.destinations,
    customAgenda: body.customAgenda ?? [],
    pricingItems: body.pricingItems ?? [],
    consultantNotes: body.consultantNotes ?? "",
    paymentTerms: body.paymentTerms ?? "",
    status: body.status ?? "Sent",
  });
  return NextResponse.json(proposal, { status: 201 });
}
