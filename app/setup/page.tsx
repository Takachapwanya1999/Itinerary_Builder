"use client";

import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

export default function SetupPage() {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check initial setup.");
        const result = (await response.json()) as { setupRequired: boolean };
        setSetupRequired(result.setupRequired);
        if (!result.setupRequired) window.location.replace("/signin");
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, setupKey }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to create the administrator.");
      window.location.assign("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the administrator.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-10">
      <section className="w-full max-w-[455px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7 flex justify-center">
          <div className="rounded-lg bg-[#101a2d] px-2 py-1">
            <BrandLogo className="h-[67px] w-[235px] object-contain" />
          </div>
        </div>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7efe6] text-[#a66a2c]"><ShieldCheck size={20} /></div>
        <div className="mt-5 text-center">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a66a2c]">One-time workspace setup</div>
          <h1 className="serif mt-2 text-[28px] text-[#172238]">Create your administrator</h1>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            Set up the first admin account. After this, only signed-in admins can add staff accounts.
          </p>
        </div>
        {setupRequired === null && !error ? (
          <p className="mt-8 text-center text-[11px] text-slate-400">Checking setup status...</p>
        ) : setupRequired && (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-[10px] font-medium text-slate-700">Full name
              <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" placeholder="Your name" />
            </label>
            <label className="block text-[10px] font-medium text-slate-700">Initial setup key
              <input required type="password" autoComplete="off" value={setupKey} onChange={(event) => setSetupKey(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" placeholder="Provided in your server environment" />
            </label>
            <label className="block text-[10px] font-medium text-slate-700">Work email
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]" placeholder="you@rusetat.com" />
            </label>
            <label className="block text-[10px] font-medium text-slate-700">Password <span className="font-normal text-slate-400">(at least 12 characters)</span>
              <div className="relative">
                <input required minLength={12} maxLength={200} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 pr-10 text-[11px] outline-none focus:border-[#c1874b]" placeholder="Create a strong password" />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-2 rounded-md p-2 text-slate-400 hover:bg-slate-100">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">{error}</p>}
            <button disabled={submitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#111c31] text-[10px] font-semibold text-white hover:bg-[#243551] disabled:opacity-60">
              {submitting ? "Creating account..." : "Create admin account"} {!submitting && <ArrowRight size={13} />}
            </button>
          </form>
        )}
        {setupRequired === false && <p className="mt-6 text-center text-[10px] text-slate-500">Setup has already been completed. Redirecting to sign in...</p>}
        {error && setupRequired === null && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">{error}</p>}
        <p className="mt-6 text-center text-[9px] leading-relaxed text-slate-400">Enter the INITIAL_SETUP_KEY from your server environment. Setup automatically closes after the first account is created.</p>
      </section>
    </main>
  );
}
