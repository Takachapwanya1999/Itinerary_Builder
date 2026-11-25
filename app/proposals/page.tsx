"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { Proposal } from "@/lib/types";

type StatusFilter = "All" | Proposal["status"];

function formatDate(value: string) {
  if (!value) return "Date not set";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: Proposal["status"]) {
  if (status === "Approved") return "bg-emerald-50 text-emerald-700";
  if (status === "Sent") return "bg-blue-50 text-blue-700";
  if (status === "Changes Requested") return "bg-amber-50 text-amber-700";
  if (status === "Declined") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadProposals() {
    const response = await fetch("/api/proposals", { cache: "no-store" });
    const body = (await response.json()) as Proposal[] | { error?: string };
    if (!response.ok) {
      throw new Error(!Array.isArray(body) && body.error ? body.error : "Unable to load proposals.");
    }
    setProposals(body as Proposal[]);
  }

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get("q") ?? "");
    loadProposals()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleProposals = useMemo(() => {
    const query = search.trim().toLowerCase();
    return proposals.filter((proposal) => {
      const matchesStatus = filter === "All" || proposal.status === filter;
      const matchesQuery =
        !query ||
        [
          proposal.clientName,
          proposal.clientEmail,
          proposal.destinations.map((destination) => destination.name).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [filter, proposals, search]);

  async function duplicate(proposal: Proposal) {
    setBusyId(proposal.id);
    setError("");
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/manage`, { method: "POST" });
      const body = (await response.json()) as Proposal | { error?: string };
      if (!response.ok) {
        throw new Error("error" in body ? body.error : "Unable to duplicate proposal.");
      }
      await loadProposals();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to duplicate proposal.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(proposal: Proposal) {
    if (!window.confirm(`Permanently delete the proposal for ${proposal.clientName}?`)) return;
    setBusyId(proposal.id);
    setError("");
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/manage`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to delete proposal.");
      }
      setProposals((current) => current.filter((item) => item.id !== proposal.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete proposal.");
    } finally {
      setBusyId("");
    }
  }

  async function send(proposal: Proposal) {
    setBusyId(proposal.id);
    setError("");
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/send`, { method: "POST" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to send proposal.");
      await loadProposals();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send proposal.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppShell
      title="Proposals"
      subtitle="Find, review and manage every client journey."
      action={
        <Link
          href="/builder"
          className="flex h-10 items-center gap-2 rounded-lg bg-[#101a2d] px-4 text-[11px] font-medium text-white transition hover:bg-[#243551]"
        >
          <Plus size={15} /> New proposal
        </Link>
      }
    >
      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-[300px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients or destinations"
              className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-[10px] outline-none focus:border-[#c1874b]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" aria-label="Filter proposals by status">
            {(["All", "Draft", "Sent", "Changes Requested", "Approved", "Declined"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
                className={`rounded-lg px-3 py-2 text-[10px] font-medium transition ${
                  filter === status ? "bg-[#101a2d] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-14 text-center text-[11px] text-slate-400">Loading proposals...</div>
        ) : visibleProposals.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2eb] text-[#b57738]">
              <FileText size={18} />
            </div>
            <p className="mt-3 text-[12px] font-medium text-slate-700">
              {proposals.length === 0 ? "No proposals yet" : "No matching proposals"}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {proposals.length === 0
                ? "Create a tailored journey for your first client."
                : "Try another search or status filter."}
            </p>
            {proposals.length === 0 && (
              <Link href="/builder" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a66a2c]">
                Build a proposal <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleProposals.map((proposal) => (
              <article key={proposal.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f2eb] text-[#ac7037]">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[11px] font-semibold text-slate-800">{proposal.clientName}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[8px] font-medium ${statusClass(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[9px] text-slate-400">{proposal.clientEmail}</p>
                    <p className="mt-1 truncate text-[9px] text-slate-500">
                      {proposal.destinations.map((destination) => destination.name).join(" · ")} ·{" "}
                      {formatDate(proposal.startDate)} – {formatDate(proposal.endDate)}
                    </p>
                    {proposal.clientFeedback && (
                      <p className="mt-1 line-clamp-2 text-[9px] text-amber-700">
                        Client feedback: {proposal.clientFeedback}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <Link
                    href={`/itinerary/${proposal.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[9px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <ExternalLink size={12} /> Open
                  </Link>
                  <Link
                    href={`/builder?edit=${encodeURIComponent(proposal.id)}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[9px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  {proposal.status !== "Approved" && (
                    <button
                      onClick={() => send(proposal)}
                      disabled={busyId === proposal.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d6b38d] bg-[#fdf9f4] px-2.5 text-[9px] font-medium text-[#8f5b2b] hover:bg-[#f8efe4] disabled:opacity-50"
                    >
                      <Send size={12} /> {proposal.status === "Draft" ? "Send" : "Resend"}
                    </button>
                  )}
                  <button
                    onClick={() => duplicate(proposal)}
                    disabled={busyId === proposal.id}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[9px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    onClick={() => remove(proposal)}
                    disabled={busyId === proposal.id}
                    aria-label={`Delete proposal for ${proposal.clientName}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[9px] font-medium text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
