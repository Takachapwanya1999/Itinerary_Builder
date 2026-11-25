"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Compass,
  FileText,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { Destination, Proposal } from "@/lib/types";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${greeting}, team`;
}

export default function Dashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState("Good morning, team");

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting());
    updateGreeting();
    const greetingInterval = window.setInterval(updateGreeting, 60_000);

    Promise.all([
      fetch("/api/proposals").then((response) => {
        if (!response.ok) throw new Error("Unable to load proposals.");
        return response.json() as Promise<Proposal[]>;
      }),
      fetch("/api/destinations").then((response) => {
        if (!response.ok) throw new Error("Unable to load destinations.");
        return response.json() as Promise<Destination[]>;
      }),
    ])
      .then(([proposalData, destinationData]) => {
        setProposals(proposalData);
        setDestinations(destinationData);
      })
      .catch((reason: Error) => setError(reason.message));

    return () => window.clearInterval(greetingInterval);
  }, []);

  const stats = [
    { label: "Proposals created", value: proposals.length, note: "All time", icon: FileText },
    {
      label: "Awaiting a reply",
      value: proposals.filter((proposal) => proposal.status === "Sent").length,
      note: "Sent to clients",
      icon: Clock3,
    },
    {
      label: "Confirmed journeys",
      value: proposals.filter((proposal) => proposal.status === "Approved").length,
      note: "Ready to travel",
      icon: Compass,
    },
    { label: "Curated destinations", value: destinations.length, note: "In your library", icon: MapPin },
  ];

  return (
    <AppShell
      title={greeting}
      subtitle="A considered journey starts here. Let’s create something memorable."
      action={
        <Link
          href="/builder"
          className="flex h-10 items-center gap-2 rounded-lg bg-[#101a2d] px-4 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#243551]"
        >
          <Plus size={15} /> Build an itinerary
        </Link>
      }
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="relative mb-7 overflow-hidden rounded-2xl bg-[#111c31] px-7 py-8 text-white md:px-10 md:py-10">
        <div className="absolute -right-12 -top-32 h-80 w-80 rounded-full border border-white/[0.09]" />
        <div className="absolute -right-1 top-[-88px] h-64 w-64 rounded-full border border-white/[0.08]" />
        <div className="absolute bottom-[-110px] right-[22%] h-56 w-56 rounded-full border border-white/[0.07]" />
        <div className="relative max-w-[610px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d6a86f]/30 bg-[#d6a86f]/10 px-3 py-1.5 text-[10px] tracking-wide text-[#eac99e]">
            <Sparkles size={12} /> YOUR NEXT GREAT JOURNEY
          </div>
          <h2 className="serif max-w-[540px] text-[31px] font-normal leading-[1.16] tracking-[-0.02em] md:text-[42px]">
            Make every journey feel <span className="italic text-[#e9bc83]">extraordinary.</span>
          </h2>
          <p className="mt-3 max-w-[430px] text-[12px] leading-[1.8] text-slate-300">
            Bring the details together in minutes. Thoughtful, bespoke travel proposals are just a few clicks away.
          </p>
          <Link
            href="/builder"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#e5a65f] px-4 text-[11px] font-semibold text-[#171d29] transition hover:bg-[#f1ba79]"
          >
            Create a proposal <ArrowRight size={14} />
          </Link>
        </div>
        <div className="absolute bottom-0 right-[4%] hidden h-[91%] w-[31%] overflow-hidden rounded-t-[100px] md:block">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=85"
            alt="Safari vehicle watching the sunset across the African savanna"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111c31] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111c31]/60 to-transparent" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }, index) => (
          <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-500 md:text-[11px]">{label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${index === 0 ? "bg-[#f8efe4] text-[#b57738]" : "bg-slate-100 text-slate-500"}`}>
                <Icon size={15} />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-[26px] font-semibold tracking-tight text-[#131c2d]">{value}</span>
              <span className="pb-1 text-[9px] text-slate-400">{note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#182236]">Recent proposals</h3>
              <p className="mt-1 text-[10px] text-slate-400">Your latest client journeys</p>
            </div>
            <Link href="/proposals" className="text-[10px] font-medium text-[#a66a2c] hover:underline">
              View all
            </Link>
          </div>
          {proposals.length === 0 ? (
            <div className="px-5 py-11 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2eb] text-[#b57738]">
                <FileText size={18} />
              </div>
              <p className="mt-3 text-[12px] font-medium text-slate-700">Your first journey is waiting</p>
              <p className="mt-1 text-[10px] text-slate-400">Create a tailored proposal for a client to get started.</p>
              <Link href="/builder" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a66a2c]">
                Start building <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {proposals.slice(0, 5).map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/itinerary/${proposal.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f2eb] text-[#ac7037]">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-slate-800">{proposal.clientName}</div>
                    <div className="mt-1 truncate text-[10px] text-slate-400">
                      {proposal.destinations.map((destination) => destination.name).join(" · ")} · {formatDate(proposal.startDate)}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${proposal.status === "Approved" ? "bg-emerald-50 text-emerald-700" : proposal.status === "Sent" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    {proposal.status}
                  </span>
                  <ArrowRight size={14} className="text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[#182236]">Explore your library</h3>
              <p className="mt-1 text-[10px] text-slate-400">Places your clients will love</p>
            </div>
            <Link href="/admin/destinations" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Manage destinations">
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {destinations.slice(0, 3).map((destination) => (
              <Link key={destination.id} href="/admin/destinations" className="group flex items-center gap-3">
                <div className="relative h-12 w-[58px] overflow-hidden rounded-lg">
                  <img src={destination.heroImage} alt={destination.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium text-slate-800">{destination.name}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{destination.country}</div>
                </div>
                <ArrowRight size={14} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#b57738]" />
              </Link>
            ))}
            <Link
              href="/admin/destinations"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2.5 text-[10px] font-medium text-slate-500 transition hover:border-[#d7b58d] hover:text-[#a66a2c]"
            >
              <Plus size={13} /> Add a destination
            </Link>
          </div>
        </section>
      </div>
      <div className="mt-7 flex items-center gap-2 text-[10px] text-slate-400">
        <ArrowDownRight size={13} className="text-[#b57738]" /> Built with care for journeys worth remembering.
      </div>
    </AppShell>
  );
}
