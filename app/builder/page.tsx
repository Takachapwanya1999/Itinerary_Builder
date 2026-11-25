"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  Compass,
  Hotel,
  Minus,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { Destination, Proposal } from "@/lib/types";

type PricingItem = { name: string; amount: number };
type AgendaItem = {
  day: number;
  title: string;
  description: string;
  destinationName: string;
};

const steps = [
  { title: "Client details", icon: UserRound },
  { title: "Destinations", icon: Compass },
  { title: "Daily itinerary", icon: ClipboardList },
  { title: "Accommodation & pricing", icon: Hotel },
  { title: "Notes & terms", icon: Send },
];

const inputClass =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c1874b] focus:ring-2 focus:ring-[#c1874b]/10";
const labelClass = "text-[10px] font-medium text-slate-600";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export default function BuilderPage() {
  const [step, setStep] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editId, setEditId] = useState("");
  const [editLoaded, setEditLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([
    { name: "Return international flights", amount: 0 },
    { name: "Accommodation & breakfast", amount: 0 },
    { name: "Private transfers & experiences", amount: 0 },
  ]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [consultantNotes, setConsultantNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "A 30% deposit secures your booking. The balance is due 45 days before departure.",
  );
  const [proposalStatus, setProposalStatus] = useState<Proposal["status"]>("Draft");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const proposalId = new URLSearchParams(window.location.search).get("edit");
    if (proposalId) setEditId(proposalId);
    fetch("/api/destinations")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load destination library.");
        return response.json() as Promise<Destination[]>;
      })
      .then(setDestinations)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/proposals/${encodeURIComponent(editId)}/manage`)
      .then(async (response) => {
        const body = (await response.json()) as Proposal | { error?: string };
        if (!response.ok) {
          throw new Error("error" in body ? body.error : "Unable to load proposal.");
        }
        return body as Proposal;
      })
      .then((proposal) => {
        setClientName(proposal.clientName);
        setClientEmail(proposal.clientEmail);
        setClientPhone(proposal.clientPhone ?? "");
        setStartDate(proposal.startDate);
        setEndDate(proposal.endDate);
        setBudget(proposal.budget === undefined ? "" : String(proposal.budget));
        setPassengers(String(proposal.passengers));
        setSelectedIds(proposal.destinations.map((destination) => destination.id));
        setAgenda(proposal.customAgenda);
        setPricing(proposal.pricingItems ?? []);
        setConsultantNotes(proposal.consultantNotes);
        setPaymentTerms(proposal.paymentTerms ?? "");
        setProposalStatus(proposal.status);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setEditLoaded(true));
  }, [editId]);

  const selectedDestinations = useMemo(
    () => destinations.filter((destination) => selectedIds.includes(destination.id)),
    [destinations, selectedIds],
  );
  const total = pricing.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  function toggleDestination(destination: Destination) {
    setSelectedIds((current) => {
      if (current.includes(destination.id)) {
        return current.filter((id) => id !== destination.id);
      }
      const next = [...current, destination.id];
      const selected = destinations.filter((item) => next.includes(item.id));
      let dayNumber = 1;
      const nextAgenda = selected.flatMap((item) =>
        item.defaultItinerary.map((day) => ({
          day: dayNumber++,
          title: day.title,
          description: day.description,
          destinationName: item.name,
        })),
      );
      setAgenda(nextAgenda);
      return next;
    });
  }

  function updateAgenda(index: number, patch: Partial<AgendaItem>) {
    setAgenda((current) =>
      current.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addAgendaDay() {
    setAgenda((current) => [
      ...current,
      {
        day: current.length + 1,
        title: "",
        description: "",
        destinationName: selectedDestinations[0]?.name ?? "",
      },
    ]);
  }

  function goNext() {
    setError("");
    if (step === 0 && (!clientName.trim() || !clientEmail.trim() || !startDate || !endDate)) {
      setError("Please add the client name, email, and travel dates before continuing.");
      return;
    }
    if (step === 1 && selectedIds.length === 0) {
      setError("Select at least one destination to continue.");
      return;
    }
    if (step < steps.length - 1) setStep((current) => current + 1);
  }

  async function createProposal() {
    setError("");
    if (selectedDestinations.length === 0) {
      setError("Select at least one destination before creating your proposal.");
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      if (editId && !editLoaded) {
        throw new Error("The existing proposal is still loading.");
      }
      const response = await fetch(
        editId ? `/api/proposals/${encodeURIComponent(editId)}/manage` : "/api/proposals",
        {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          startDate,
          endDate,
          budget: budget ? Number(budget) : undefined,
          passengers: Number(passengers) || 1,
          totalPrice: total,
          currency: "USD",
          destinations: selectedDestinations,
          customAgenda: agenda,
          pricingItems: pricing,
          consultantNotes,
          paymentTerms,
          status: editId ? proposalStatus : ("Draft" satisfies Proposal["status"]),
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Could not create the proposal.");
      }
      const proposal = (await response.json()) as Proposal;
      window.location.assign(`/proposals`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the proposal.");
      setSaving(false);
    }
  }

  return (
    <AppShell
      title={editId ? "Edit a journey" : "Build a journey"}
      subtitle={editId ? "Update the details of this client proposal." : "A bespoke proposal, thoughtfully brought together in a few simple steps."}
    >
      <div className="mx-auto max-w-[970px]">
        <div className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-5 md:px-7">
          <div className="flex items-start">
            {steps.map(({ title, icon: Icon }, index) => {
              const complete = index < step;
              const active = index === step;
              return (
                <div key={title} className="relative flex min-w-0 flex-1 flex-col items-center">
                  {index !== 0 && (
                    <div className={`absolute right-[50%] top-[16px] h-px w-full ${index <= step ? "bg-[#d19a61]" : "bg-slate-200"}`} />
                  )}
                  <button
                    onClick={() => index < step && setStep(index)}
                    disabled={index >= step}
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      complete
                        ? "border-[#b87c3d] bg-[#b87c3d] text-white"
                        : active
                          ? "border-[#b87c3d] bg-[#fbf5ef] text-[#9b612b] ring-4 ring-[#f7ede2]"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                    aria-label={`Step ${index + 1}: ${title}`}
                  >
                    {complete ? <Check size={14} /> : <Icon size={14} />}
                  </button>
                  <span className={`mt-2 hidden text-center text-[9px] sm:block ${active ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                    {title}
                  </span>
                  <span className={`mt-2 text-[9px] sm:hidden ${active ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                    {index + 1} / 5
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 px-5 py-5 md:px-7">
            <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#ac7037]">
              STEP {String(step + 1).padStart(2, "0")} OF 05
            </div>
            <h2 className="serif mt-1.5 text-[22px] font-medium text-[#142039]">
              {steps[step].title}
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              {[
                "Let’s start with who you’re planning this journey for.",
                "Choose one or more destinations to shape your itinerary.",
                "Make each day your own. The suggested plan is ready to edit.",
                "Build a clear, considered investment for the journey.",
                "Add a personal note and the details your client needs.",
              ][step]}
            </p>
          </div>

          <div className="min-h-[350px] px-5 py-6 md:px-7 md:py-7">
            {step === 0 && (
              <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                <Field label="Client name *">
                  <input className={inputClass} placeholder="e.g. Alex Morgan" value={clientName} onChange={(event) => setClientName(event.target.value)} />
                </Field>
                <Field label="Email address *">
                  <input type="email" className={inputClass} placeholder="alex@example.com" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
                </Field>
                <Field label="Phone number">
                  <input type="tel" className={inputClass} placeholder="+1 (555) 000-0000" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} />
                </Field>
                <Field label="Number of travelers">
                  <input type="number" min="1" className={inputClass} value={passengers} onChange={(event) => setPassengers(event.target.value)} />
                </Field>
                <Field label="Departure date *">
                  <input type="date" className={inputClass} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </Field>
                <Field label="Return date *">
                  <input type="date" min={startDate} className={inputClass} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </Field>
                <Field label="Approximate budget (USD)">
                  <div className="relative">
                    <span className="absolute left-3 top-[18px] text-[12px] text-slate-400">$</span>
                    <input type="number" min="0" className={`${inputClass} pl-7`} placeholder="e.g. 8500" value={budget} onChange={(event) => setBudget(event.target.value)} />
                  </div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((destination) => {
                  const selected = selectedIds.includes(destination.id);
                  return (
                    <button
                      type="button"
                      key={destination.id}
                      onClick={() => toggleDestination(destination)}
                      className={`group overflow-hidden rounded-xl border text-left transition ${
                        selected ? "border-[#bd8750] ring-2 ring-[#bd8750]/15" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="relative h-[130px] overflow-hidden">
                        <img src={destination.heroImage} alt={destination.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full ${selected ? "bg-[#c58d52] text-white" : "border border-white/80 bg-black/10 text-transparent"}`}>
                          <Check size={13} />
                        </span>
                        <span className="absolute bottom-3 left-3 text-[10px] font-medium text-white">{destination.country}</span>
                      </div>
                      <div className="p-3.5">
                        <div className="text-[12px] font-semibold text-slate-800">{destination.name}</div>
                        <div className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">{destination.summary}</div>
                        <div className="mt-3 text-[9px] text-slate-400">{destination.defaultItinerary.length} suggested days · {destination.accommodations.length} stays</div>
                      </div>
                    </button>
                  );
                })}
                {destinations.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-slate-200 px-5 py-12 text-center text-[11px] text-slate-500">
                    No destinations in your library yet.{" "}
                    <Link href="/admin/destinations" className="font-medium text-[#a66a2c] underline">Add a destination</Link>.
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {agenda.map((item, index) => (
                  <div key={`${item.destinationName}-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#f7efe6] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#9a612c]">DAY {item.day}</span>
                        <span className="text-[9px] text-slate-400">{item.destinationName}</span>
                      </div>
                      <button
                        onClick={() => setAgenda((current) => current.filter((_, position) => position !== index).map((day, position) => ({ ...day, day: position + 1 })))}
                        className="rounded-md p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove day ${item.day}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      className="w-full border-0 p-0 text-[12px] font-medium text-slate-800 outline-none placeholder:text-slate-300"
                      value={item.title}
                      placeholder="Activity title"
                      onChange={(event) => updateAgenda(index, { title: event.target.value })}
                    />
                    <textarea
                      className="mt-2 min-h-[54px] w-full resize-y border-0 p-0 text-[10px] leading-[1.7] text-slate-500 outline-none placeholder:text-slate-300"
                      value={item.description}
                      placeholder="Describe this day's experiences..."
                      onChange={(event) => updateAgenda(index, { description: event.target.value })}
                    />
                  </div>
                ))}
                <button onClick={addAgendaDay} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-3 text-[10px] font-medium text-slate-500 transition hover:border-[#c38e55] hover:text-[#a66a2c]">
                  <CirclePlus size={14} /> Add another day
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-4 grid grid-cols-[1fr_125px_34px] gap-3 px-1 text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:grid-cols-[1fr_160px_34px]">
                  <span>Item description</span><span className="text-right">Amount (USD)</span><span />
                </div>
                <div className="space-y-2.5">
                  {pricing.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_125px_34px] items-center gap-3 sm:grid-cols-[1fr_160px_34px]">
                      <input className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" value={item.name} placeholder="Line item" onChange={(event) => setPricing((current) => current.map((row, position) => position === index ? { ...row, name: event.target.value } : row))} />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                        <input type="number" min="0" className="h-10 w-full rounded-lg border border-slate-200 pl-7 pr-2 text-right text-[11px] outline-none focus:border-[#c1874b]" value={item.amount} onChange={(event) => setPricing((current) => current.map((row, position) => position === index ? { ...row, amount: Number(event.target.value) } : row))} />
                      </div>
                      <button onClick={() => setPricing((current) => current.filter((_, position) => position !== index))} aria-label={`Remove ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500">
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPricing((current) => [...current, { name: "", amount: 0 }])} className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-[#a66a2c] hover:underline">
                  <Plus size={13} /> Add a line item
                </button>
                <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Total trip investment</div>
                    <div className="mt-1 text-[9px] text-slate-400">For {passengers || 1} traveler{Number(passengers) === 1 ? "" : "s"} · USD</div>
                  </div>
                  <div className="text-right text-[23px] font-semibold tracking-tight text-[#172238]">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-[9px] leading-relaxed text-slate-400">
                  <ShieldAlert size={13} className="mt-px shrink-0" />
                  Final pricing is subject to availability and confirmation at the time of booking.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="rounded-lg border border-[#f0dfc9] bg-[#fdf9f4] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#92602f]">
                    <Sparkles size={13} /> A personal welcome
                  </div>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-[#9a8066]">
                    This note will appear near the beginning of {clientName ? `${clientName}’s` : "your client’s"} proposal.
                  </p>
                </div>
                <Field label="Message to your client">
                  <textarea className="mt-1.5 min-h-[115px] w-full resize-y rounded-lg border border-slate-200 p-3 text-[11px] leading-[1.7] outline-none focus:border-[#c1874b]" placeholder="Dear client, I’m delighted to share this journey with you..." value={consultantNotes} onChange={(event) => setConsultantNotes(event.target.value)} />
                </Field>
                <Field label="Payment terms & booking conditions">
                  <textarea className="mt-1.5 min-h-[88px] w-full resize-y rounded-lg border border-slate-200 p-3 text-[11px] leading-[1.7] outline-none focus:border-[#c1874b]" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
                </Field>
                <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-amber-800"><ShieldAlert size={13} /> Visa &amp; entry reminder</div>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-amber-800/70">
                    Destination entry guidance will be included automatically. Remind your client that requirements can change and should be confirmed with official authorities before travel.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-[10px] text-slate-600">
                  Proposal for <span className="font-semibold">{clientName || "your client"}</span> · {selectedDestinations.map((destination) => destination.name).join(" + ") || "Select destination"} · {agenda.length} planned days · <span className="font-semibold">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>
            )}

            {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">{error}</div>}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4 md:px-7">
            <Link href={step === 0 ? "/" : "#"} onClick={step > 0 ? (event) => { event.preventDefault(); setStep((current) => current - 1); setError(""); } : undefined} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-medium text-slate-500 transition hover:bg-slate-100 ${step === 0 ? "" : ""}`}>
              <ArrowLeft size={14} /> {step === 0 ? "Save and exit" : "Back"}
            </Link>
            {step < steps.length - 1 ? (
              <button onClick={goNext} className="flex h-9 items-center gap-2 rounded-lg bg-[#111c31] px-4 text-[10px] font-medium text-white transition hover:bg-[#243551]">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button disabled={saving || (Boolean(editId) && !editLoaded)} onClick={createProposal} className="flex h-9 items-center gap-2 rounded-lg bg-[#b57738] px-4 text-[10px] font-semibold text-white transition hover:bg-[#9d652e] disabled:cursor-wait disabled:opacity-60">
                <CheckCircle2 size={14} /> {saving ? "Saving proposal..." : editId ? "Save changes" : "Save as draft"}
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[9px] text-slate-400">Your proposal is saved securely when you create it. You can share or print it anytime.</p>
      </div>
    </AppShell>
  );
}
