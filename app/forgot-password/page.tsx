"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to request a password reset.");
      setMessage(body.message || "If an active account matches that email, reset instructions will be sent.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to request a password reset.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-5">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">Account recovery</div>
        <h1 className="serif mt-2 text-[28px] text-[#172238]">Reset your password</h1>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Enter your workspace email. If it belongs to an active account, we’ll send a secure reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-[10px] font-medium text-slate-600">
            Email address
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800">{message}</p>}
          <button disabled={submitting} className="h-10 w-full rounded-lg bg-[#111c31] text-[10px] font-semibold text-white disabled:opacity-60">
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-[10px] font-medium text-[#a66a2c] hover:underline">Back to sign in</Link>
      </section>
    </main>
  );
}
