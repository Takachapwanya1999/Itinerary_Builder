import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import {
  deleteProposal,
  duplicateProposal,
  getProposal,
  replaceProposal,
} from "@/lib/store";
import type { Proposal } from "@/lib/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  return NextResponse.json(proposal, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Partial<Proposal> | null;
  if (
    !body?.clientName?.trim() ||
    !body.clientEmail?.trim() ||
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
  const proposal = await replaceProposal(id, {
    clientName: body.clientName.trim(),
    clientEmail: body.clientEmail.trim(),
    clientPhone: body.clientPhone ?? "",
    consultantEmail: body.consultantEmail ?? auth.user.email,
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
    status: body.status ?? "Draft",
  });
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  return NextResponse.json(proposal, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const proposal = await duplicateProposal(id);
  if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  return NextResponse.json(proposal, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const deleted = await deleteProposal(id);
  return deleted
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Proposal not found." }, { status: 404 });
}
