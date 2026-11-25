"use client";

import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";

const fieldClass = "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[11px] outline-none focus:border-[#c1874b]";

export default function DestinationInquiryPage() {
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDestination(new URLSearchParams(window.location.search).get("destination") ?? "");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, name, email, message }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to send your inquiry.");
      setNotice(body.message || "Your inquiry has been sent.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send your inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#faf9f7] px-5 py-10">
      <section className="w-full max-w-[540px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/destinations" className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-[#a66a2c]"><ArrowLeft size={13} /> Browse destinations</Link>
        <div className="mt-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">Start a conversation</div>
        <h1 className="serif mt-2 text-[31px] text-[#172238]">Let’s plan something memorable.</h1>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Share a few details and a Rusetat travel consultant will be in touch.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-[10px] font-medium text-slate-600">Your name
            <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">Email address
            <input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">Destination of interest
            <input maxLength={120} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Where would you like to go?" className={fieldClass} />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">Tell us about your plans
            <textarea required minLength={10} maxLength={3000} value={message} onChange={(event) => setMessage(event.target.value)} className={`${fieldClass} min-h-[120px] resize-y`} placeholder="When you hope to travel, who is coming along, and what you enjoy..." />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800">{notice}</p>}
          <button disabled={submitting} className="flex h-10 items-center gap-2 rounded-lg bg-[#111c31] px-4 text-[10px] font-semibold text-white hover:bg-[#243551] disabled:opacity-60">
            <Send size={13} /> {submitting ? "Sending..." : "Send inquiry"}
          </button>
        </form>
      </section>
    </main>
  );
}
