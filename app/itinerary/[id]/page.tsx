"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import type { PublicProposal } from "@/lib/types";

function prettyDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
}

export default function ProposalPage() {
  const params = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [clientFeedback, setClientFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/proposals/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error || "Unable to load this proposal.");
        }
        return (await response.json()) as PublicProposal;
      })
      .then(setProposal)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const agendaByDay = useMemo(() => {
    if (!proposal) return [];
    if (proposal.customAgenda?.length) return proposal.customAgenda;
    return proposal.destinations.flatMap((destination) =>
      destination.defaultItinerary.map((day) => ({
        ...day,
        destinationName: destination.name,
      })),
    );
  }, [proposal]);

  async function respondToProposal(status: "Approved" | "Changes Requested" | "Declined") {
    if (!proposal) return;
    setApproving(true);
    setError("");
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: clientFeedback }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to approve this proposal.");
      }
      const result = (await response.json()) as {
        proposal: PublicProposal;
        notificationError?: string;
      };
      setProposal(result.proposal);
      if (result.notificationError) setNotice(result.notificationError);
      setApproved(status === "Approved");
      setClientFeedback("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to approve this proposal.");
    } finally {
      setApproving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the proposal link. You can copy it from your browser address bar.");
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] text-[12px] text-slate-400">Preparing your journey...</div>;
  }
  if (!proposal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] px-5 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe6] text-[#b57738]"><MapPin size={20} /></div>
        <h1 className="serif mt-4 text-2xl text-[#172238]">We couldn’t find this journey</h1>
        <p className="mt-2 text-[11px] text-slate-500">{error}</p>
        <Link href="/" className="mt-5 text-[11px] font-medium text-[#a66a2c]">Back to workspace</Link>
      </div>
    );
  }

  const cover = proposal.destinations[0];
  const currency = proposal.currency || "USD";
  const money = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  const duration = Math.max(
    1,
    Math.round((new Date(`${proposal.endDate}T12:00:00`).getTime() - new Date(`${proposal.startDate}T12:00:00`).getTime()) / 86400000),
  );
  const pricingItems = proposal.pricingItems?.filter((item) => item.name.trim()) ?? [];

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#172238]">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1120px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center">
            <div className="rounded-lg bg-[#101a2d] px-2 py-1">
              <BrandLogo className="h-[53px] w-[170px] object-contain sm:w-[190px]" />
            </div>
          </Link>
          <div className="hidden text-center sm:block">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">Your private journey proposal</div>
            <div className="mt-1 text-[10px] text-slate-400">Prepared especially for {proposal.clientName}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="hidden h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 sm:flex">
              {copied ? <Check size={13} /> : <ArrowDown size={13} />}
              {copied ? "Link copied" : "Share proposal"}
            </button>
            <button onClick={() => window.print()} className="flex h-10 items-center gap-1.5 rounded-lg bg-[#101a2d] px-4 text-[10px] font-medium text-white transition hover:bg-[#243551]">
              <Download size={13} /> <span className="hidden sm:inline">Download PDF</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="proposal-print mx-auto max-w-[1020px] px-4 pb-16 pt-5 sm:px-7 md:pt-8">
        <div className="no-print mb-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#a66a2c]"><ArrowLeft size={14} /> Back to workspace</Link>
          <span className={`rounded-full px-3 py-1.5 text-[9px] font-medium ${proposal.status === "Approved" ? "bg-emerald-100 text-emerald-800" : proposal.status === "Sent" ? "bg-blue-50 text-blue-700" : proposal.status === "Changes Requested" ? "bg-amber-50 text-amber-700" : proposal.status === "Declined" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
            {proposal.status === "Approved" ? "Journey approved" : proposal.status === "Changes Requested" ? "Changes requested" : proposal.status === "Declined" ? "Proposal declined" : `${proposal.status} proposal`}
          </span>
        </div>

        <section className="print-shadow-none relative min-h-[390px] overflow-hidden rounded-[22px] bg-[#121d31] shadow-[0_18px_55px_rgba(15,23,42,0.16)] md:min-h-[490px]">
          <img src={cover?.heroImage || "/great-zimbabwe.png"} alt={cover?.name ?? "Journey destination"} className="absolute inset-0 h-full w-full object-cover opacity-[0.72]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101a2d]/95 via-[#101a2d]/65 to-[#101a2d]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101a2d]/45 to-transparent" />
          <div className="relative flex min-h-[390px] max-w-[720px] flex-col justify-end px-6 pb-8 pt-24 text-white md:min-h-[490px] md:px-12 md:pb-12">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#efc58f]">
              <span className="h-px w-7 bg-[#d49b5c]" /> Your journey, thoughtfully arranged
            </div>
            <div className="mb-2 text-[11px] tracking-wide text-white/75">A private travel proposal for {proposal.clientName}</div>
            <h1 className="serif max-w-[680px] text-[42px] font-normal leading-[1.04] tracking-[-0.025em] md:text-[66px]">
              {cover?.name || "Your next adventure"}
              {proposal.destinations.length > 1 && <span className="block text-[#edc591]"> &amp; beyond</span>}
            </h1>
            {proposal.destinations.length > 1 && (
              <p className="mt-3 text-[12px] text-white/75">{proposal.destinations.map((destination) => destination.name).join("  ·  ")}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/25 pt-5 text-[11px] text-white/90">
              <span className="flex items-center gap-2"><Clock3 size={15} className="text-[#e7b77b]" /> {prettyDate(proposal.startDate)} – {prettyDate(proposal.endDate)}</span>
              <span className="flex items-center gap-2"><Users size={15} className="text-[#e7b77b]" /> {proposal.passengers} traveler{proposal.passengers === 1 ? "" : "s"}</span>
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[#e7b77b]" /> {duration} nights</span>
            </div>
          </div>
          <div className="absolute right-10 top-10 hidden text-right text-white/85 md:block">
            <div className="serif text-[18px]">Thoughtfully planned</div>
            <div className="mt-1.5 text-[9px] uppercase tracking-[0.2em]">Rusetat · Est. 2012</div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:gap-6">
          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">A personal note</div>
            <h2 className="serif mt-3 text-[27px] text-[#172238]">Dear {proposal.clientName},</h2>
            <p className="mt-4 whitespace-pre-line text-[13px] leading-[1.9] text-slate-600">
              {proposal.consultantNotes || `We’re delighted to share this thoughtfully curated journey with you. From the first arrival to the last sunset, every detail has been chosen to help you experience ${proposal.destinations.map((destination) => destination.name).join(" and ")} in a way that feels entirely your own.`}
            </p>
            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-[11px] font-medium text-[#9a6a3e]">
              <Sparkles size={14} /> Your journey, made personal
            </div>
          </div>
          <div className="rounded-2xl bg-[#111c31] p-6 text-white md:p-7">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e5b47a]">Journey overview</div>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-3 text-[11px]"><span className="text-white/55">Travelers</span><span>{proposal.passengers}</span></div>
              <div className="flex justify-between gap-3 text-[11px]"><span className="text-white/55">Duration</span><span>{duration} nights</span></div>
              <div className="flex justify-between gap-3 text-[11px]"><span className="text-white/55">Destinations</span><span className="text-right">{proposal.destinations.length}</span></div>
              <div className="flex justify-between gap-3 text-[11px]"><span className="text-white/55">Travel dates</span><span className="text-right">{prettyDate(proposal.startDate).split(",")[0]} – {prettyDate(proposal.endDate).split(",")[0]}</span></div>
            </div>
            <div className="mt-6 border-t border-white/15 pt-5">
              <div className="text-[9px] font-medium tracking-[0.12em] text-white/55">TOTAL JOURNEY INVESTMENT</div>
              <div className="serif mt-2 text-[34px] text-[#edc591]">{money(proposal.totalPrice)}</div>
              <div className="mt-1.5 text-[10px] text-white/45">For your party · {currency}</div>
            </div>
          </div>
        </section>

        <section className="proposal-section mt-14">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#a66a2c]">Your itinerary</div>
              <h2 className="serif mt-2 text-[30px] text-[#172238] md:text-[34px]">A journey, day by day</h2>
            </div>
            <span className="hidden rounded-full bg-[#f1e8dc] px-3 py-1.5 text-[10px] font-medium text-[#855a34] sm:block">{agendaByDay.length} thoughtfully planned days</span>
          </div>
          <div className="relative mt-7 space-y-4 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-[#e6d4bb] md:space-y-5">
            {agendaByDay.map((day, index) => {
              return (
                <article key={`${day.day}-${day.title}-${index}`} className="relative flex gap-4 md:gap-6">
                  <div className="relative z-10 flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full border-4 border-[#faf9f7] bg-[#b57738] text-[10px] font-semibold text-white shadow-sm">
                    {String(day.day).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-[#e9e3da] bg-white px-5 py-5 shadow-[0_3px_14px_rgba(27,34,48,0.035)] md:px-7 md:py-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a66a2c]">Day {day.day}{day.destinationName ? ` · ${day.destinationName}` : ""}</span>
                      {index === 0 && <span className="rounded-full bg-[#f7efe6] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wide text-[#9a612c]">Arrival</span>}
                    </div>
                    <h3 className="serif mt-2 text-[21px] leading-snug text-[#172238] md:text-[24px]">{day.title || `Day ${day.day}`}</h3>
                    <p className="mt-2.5 whitespace-pre-line text-[12px] leading-[1.85] text-slate-600 md:text-[13px]">
                      {day.description || "A day to explore at your own pace."}
                    </p>
                  </div>
                </article>
              );
            })}
            {agendaByDay.length === 0 && <p className="ml-[58px] rounded-xl border border-slate-200 bg-white p-5 text-[12px] text-slate-500">Your daily itinerary is being finalized with your consultant.</p>}
          </div>
        </section>

        {proposal.destinations.some((destination) => destination.accommodations.length > 0) && <section className="proposal-section mt-14">
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#a66a2c]">Your stay</div>
            <h2 className="serif mt-2 text-[30px] text-[#172238] md:text-[34px]">A place to call home</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {proposal.destinations.flatMap((destination) =>
              destination.accommodations.map((stay) => (
                <article key={`${destination.id}-${stay.name}`} className="overflow-hidden rounded-xl border border-[#e9e3da] bg-white shadow-[0_3px_14px_rgba(27,34,48,0.035)]">
                  <div className="relative h-[190px] w-full overflow-hidden">
                    <img src={stay.image || destination.heroImage} alt={stay.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a66a2c]">{destination.name}</div>
                    <h3 className="serif mt-1.5 text-[21px] text-slate-800">{stay.name}</h3>
                    <div className="mt-1 text-[12px] tracking-[0.1em] text-[#c28b4d]">{"★".repeat(Math.max(0, Math.min(5, stay.rating)))}</div>
                    <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">{stay.description}</p>
                  </div>
                </article>
              )),
            )}
          </div>
        </section>}

        <section className="proposal-section mt-14 grid items-start gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#eadcc8] bg-[#fffaf3] p-6 md:p-7">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#865b2e]"><ShieldCheck size={16} /> Before you travel</div>
            <p className="mt-3 text-[11px] leading-[1.85] text-slate-600">
              Entry requirements can vary by nationality and may change. Please verify passport validity, visa requirements, health certificates and any other entry requirements with the relevant official authorities before travel.
            </p>
            <div className="mt-4 space-y-3">
              {proposal.destinations.map((destination) => (
                <div key={destination.id} className="border-t border-amber-100 pt-3">
                  <div className="text-[10px] font-semibold text-slate-700">{destination.name}, {destination.country}</div>
                  <p className="mt-1.5 text-[10px] leading-[1.8] text-slate-500">{destination.visaNotes || "Please check current entry requirements with the relevant official authorities before departure."}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e9e3da] bg-white p-6 md:p-7">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">Your investment</div>
            <h2 className="serif mt-2 text-[25px] text-[#172238]">A clear breakdown</h2>
            <div className="mt-5 space-y-4">
              {pricingItems.length > 0 ? pricingItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-500">{item.name}</span>
                  <span className="shrink-0 font-medium text-slate-700">{money(item.amount)}</span>
                </div>
              )) : (
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-500">Curated journey package</span>
                  <span className="shrink-0 font-medium text-slate-700">{money(proposal.totalPrice)}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-[12px] font-semibold">
              <span>Total · {proposal.passengers} traveler{proposal.passengers === 1 ? "" : "s"}</span><span>{money(proposal.totalPrice)}</span>
            </div>
            {proposal.paymentTerms && <p className="mt-4 border-t border-slate-100 pt-4 text-[10px] leading-[1.8] text-slate-500">{proposal.paymentTerms}</p>}
            <p className="mt-3 text-[9px] leading-relaxed text-slate-400">Prices are subject to availability and confirmation at the time of booking.</p>
          </div>
        </section>

        {error && <div role="alert" className="no-print mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[11px] text-red-700">{error}</div>}
        {notice && <div role="status" className="no-print mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[11px] text-amber-800">{notice}</div>}

        <section className="no-print mt-14 overflow-hidden rounded-[22px] border border-[#e7dfd4] bg-white px-6 py-8 shadow-[0_8px_32px_rgba(27,34,48,0.06)] md:px-10 md:py-10">
          {approved || proposal.status === "Approved" ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={22} /></div>
              <h2 className="serif mt-4 text-[28px] text-[#172238]">How wonderful, {proposal.clientName.split(" ")[0]}.</h2>
              <p className="mt-2 text-[12px] text-slate-500">Your response has been recorded. Your consultant will be in touch with the next steps.</p>
            </div>
          ) : proposal.status === "Declined" ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600"><CheckCircle2 size={22} /></div>
              <h2 className="serif mt-4 text-[28px] text-[#172238]">Thank you for letting us know.</h2>
              <p className="mt-2 text-[12px] text-slate-500">Your consultant will be in touch if you’d like to plan another journey.</p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe6] text-[#a66a2c]"><Sparkles size={20} /></div>
              <div className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">The next step</div>
              <h2 className="serif mt-2 text-[29px] text-[#172238]">Shall we make this journey yours?</h2>
              <p className="mx-auto mt-2 max-w-[500px] text-[12px] leading-relaxed text-slate-500">Approve the proposal, or tell your consultant what you’d like to adjust. We’ll take it from there.</p>
              {proposal.status === "Changes Requested" && proposal.clientFeedback && (
                <p className="mx-auto mt-5 max-w-[560px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-[11px] leading-relaxed text-amber-900">
                  Your feedback: {proposal.clientFeedback}
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {proposal.consultantEmail ? (
                  <a href={`mailto:${proposal.consultantEmail}?subject=${encodeURIComponent(`A question about your ${cover?.name ?? ""} journey`)}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-[10px] font-medium text-slate-700 hover:bg-slate-50"><Mail size={14} /> Contact your consultant</a>
                ) : (
                  <span className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-[10px] font-medium text-slate-500"><Mail size={14} /> Contact your consultant</span>
                )}
              </div>
              <label className="mx-auto mt-6 block max-w-[560px] text-left text-[10px] font-medium text-slate-700">
                Would you like anything changed?
                <textarea
                  value={clientFeedback}
                  onChange={(event) => setClientFeedback(event.target.value)}
                  maxLength={2000}
                  placeholder="Share any changes or questions with your consultant..."
                  className="mt-2 min-h-[90px] w-full rounded-lg border border-slate-200 bg-white p-3.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#c1874b] focus:ring-2 focus:ring-[#c1874b]/10"
                />
              </label>
              <div className="mt-3 flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => respondToProposal("Changes Requested")}
                  disabled={approving || !clientFeedback.trim()}
                  className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {approving ? "Sending..." : "Request changes"}
                </button>
                <button
                  onClick={() => respondToProposal("Declined")}
                  disabled={approving}
                  className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-[10px] font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => respondToProposal("Approved")}
                  disabled={approving}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#111c31] px-5 text-[10px] font-semibold text-white hover:bg-[#243551] disabled:opacity-60"
                >
                  <CheckCircle2 size={14} /> {approving ? "Confirming..." : "Approve this proposal"}
                </button>
              </div>
            </>
          )}
        </section>
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[9px] text-slate-400 sm:flex-row">
          <span className="rounded-md bg-[#101a2d] px-1.5 py-0.5">
            <BrandLogo className="h-[30px] w-[100px] object-contain" />
          </span>
          <span>Rusetat Migration &amp; Travel International · Thoughtfully planned, just for you.</span>
          <span>Proposal prepared {new Date(proposal.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
        </footer>
      </main>
    </div>
  );
}
