import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getDestinations, saveDestination } from "@/lib/store";
import type { Destination } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  return NextResponse.json(await getDestinations());
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("response" in auth) return auth.response;
  const body = (await request.json()) as Partial<Destination>;
  if (!body.name || !body.country || !body.heroImage) {
    return NextResponse.json(
      { error: "Destination name, country, and hero image are required." },
      { status: 400 },
    );
  }
  const destination = await saveDestination({
    ...body,
    name: body.name,
    country: body.country,
    heroImage: body.heroImage,
    highlights: body.highlights ?? [],
    visaNotes: body.visaNotes ?? "",
    defaultItinerary: body.defaultItinerary ?? [],
    accommodations: body.accommodations ?? [],
  });
  return NextResponse.json(destination, { status: body.id ? 200 : 201 });
}
