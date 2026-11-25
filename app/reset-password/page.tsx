"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to reset password.");
      setMessage(body.message || "Password updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-5">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">Secure account access</div>
        <h1 className="serif mt-2 text-[28px] text-[#172238]">Choose a new password</h1>
        <p className="mt-2 text-[11px] text-slate-500">Use at least 12 characters. Reset links expire after 30 minutes.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-[10px] font-medium text-slate-600">
            New password
            <input required minLength={12} maxLength={200} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800">{message}</p>}
          <button disabled={submitting || !token} className="h-10 w-full rounded-lg bg-[#111c31] text-[10px] font-semibold text-white disabled:opacity-60">
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-[10px] font-medium text-[#a66a2c] hover:underline">Back to sign in</Link>
      </section>
    </main>
  );
}
