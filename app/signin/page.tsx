"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to sign in.");
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const nextPath =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/";
      window.location.assign(nextPath);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#f1efeb] p-0 lg:grid lg:place-items-center lg:p-5 xl:p-7">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(27,34,48,0.12)] lg:min-h-[calc(100svh-40px)] lg:flex-row lg:rounded-[22px] xl:min-h-[calc(100svh-56px)]">
        <section className="relative flex min-h-[470px] flex-col justify-between overflow-hidden bg-[#101a2d] px-6 py-6 text-white sm:min-h-[520px] sm:px-9 sm:py-8 lg:min-h-0 lg:w-[52%] lg:px-11 lg:py-9 xl:px-14 xl:py-11">
          <img
            src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=90"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.52]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1424]/55 via-[#0d1728]/25 to-[#0a1424]/90" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1424]/75 via-[#0d1728]/35 to-[#0d1728]/15" />
          <div className="pointer-events-none absolute -left-32 top-[28%] h-80 w-80 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -left-20 top-[33%] h-56 w-56 rounded-full border border-white/[0.07]" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex h-[58px] items-center rounded-xl border border-white/[0.12] bg-[#0d1728]/65 px-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md sm:h-[66px]">
              <BrandLogo className="h-[50px] w-[180px] object-contain sm:h-[58px] sm:w-[210px] lg:h-[62px] lg:w-[220px]" />
            </div>
            <span className="hidden shrink-0 rounded-full border border-white/[0.22] bg-white/[0.04] px-3.5 py-2 text-[9px] font-medium tracking-[0.14em] text-white/85 sm:inline-flex lg:text-[10px]">
              PRIVATE CLIENT WORKSPACE
            </span>
          </div>

          <div className="relative z-10 mt-12 max-w-[570px] sm:mt-14 lg:mb-8 lg:mt-auto xl:mb-10">
            <div className="mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#edc18b] sm:text-[10px]">
              <Sparkles size={13} strokeWidth={1.7} />
              A more considered way to travel
            </div>
            <h1
              className="serif max-w-[540px] text-[36px] font-normal leading-[1.13] tracking-[-0.018em] text-white sm:text-[44px] lg:text-[48px] xl:text-[56px]"
              style={{ textShadow: "0 3px 28px rgba(4, 10, 20, 0.38)" }}
            >
              Every remarkable journey starts with{" "}
              <span className="italic text-[#f0c894]">a thoughtful plan.</span>
            </h1>
            <p className="mt-4 max-w-[400px] text-[11px] leading-[1.85] text-white/80 sm:text-[12px]">
              A private workspace for the people who make every detail, every
              connection and every journey matter.
            </p>

            <div className="mt-7 hidden max-w-[455px] grid-cols-2 gap-3 sm:grid">
              <div className="rounded-[10px] border border-white/[0.14] bg-[#101a2d]/45 px-4 py-3.5 backdrop-blur-md">
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#edc18b]">Made personal</div>
                <p className="mt-1.5 text-[9px] leading-[1.7] text-white/75">Itineraries shaped around the people taking them.</p>
              </div>
              <div className="rounded-[10px] border border-white/[0.14] bg-[#101a2d]/45 px-4 py-3.5 backdrop-blur-md">
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#edc18b]">Made with care</div>
                <p className="mt-1.5 text-[9px] leading-[1.7] text-white/75">Thoughtful details, from first hello to home again.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-7 hidden items-center justify-between gap-4 border-t border-white/[0.18] pt-4 text-[8px] tracking-[0.06em] text-white/65 sm:flex lg:mt-0">
            <span>RUSETAT MIGRATION &amp; TRAVEL INTERNATIONAL</span>
            <span className="text-right">TRAVEL, THOUGHTFULLY ARRANGED</span>
          </div>
        </section>

        <section className="relative flex flex-1 flex-col items-center overflow-hidden bg-[#fbfaf8] px-6 py-10 sm:px-10 sm:py-12 lg:justify-between lg:px-11 lg:py-9 xl:px-16 xl:py-11">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_8%,rgba(198,166,128,0.13),transparent_38%),linear-gradient(145deg,#fffdfa,#f7f5f1)]" />
          <div className="pointer-events-none absolute -right-36 -top-32 h-[390px] w-[390px] rounded-full border border-[#e8dfd4]/80" />
          <div className="pointer-events-none absolute -right-24 -top-20 h-[270px] w-[270px] rounded-full border border-[#eee7de]" />
          <div className="pointer-events-none absolute -bottom-48 -left-40 h-[360px] w-[360px] rounded-full border border-[#ebe4da]" />

          <div className="relative z-10 my-auto w-full max-w-[410px]">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-[15px] border border-[#e9ddcf] bg-[#f7f0e8] text-[#a66a2c] shadow-[0_6px_18px_rgba(157,111,58,0.10)]">
              <LockKeyhole size={19} strokeWidth={1.7} />
            </div>

            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a66a2c]">Consultant access</div>
            <h2 className="serif mt-2.5 text-[34px] font-normal tracking-[-0.025em] text-[#172238] sm:text-[38px]">
              Welcome back.
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 sm:text-[12px]">
              Sign in to continue to your Rusetat workspace.
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-[18px]">
              <label className="block text-[10px] font-semibold text-[#334155] sm:text-[11px]">
                Email address
                <div className="relative">
                  <Mail size={16} strokeWidth={1.7} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    suppressHydrationWarning
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@rusetat.com"
                    className="mt-2 h-[54px] w-full rounded-[11px] border border-[#e1e3e5] bg-white/90 pl-12 pr-4 text-[12px] font-normal text-[#172238] shadow-[0_2px_5px_rgba(15,23,42,0.025)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#c9cdd2] focus:border-[#b88752] focus:ring-4 focus:ring-[#b88752]/[0.12]"
                  />
                </div>
              </label>

              <label className="block text-[10px] font-semibold text-[#334155] sm:text-[11px]">
                Password
                <div className="relative">
                  <LockKeyhole size={16} strokeWidth={1.7} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    suppressHydrationWarning
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 h-[54px] w-full rounded-[11px] border border-[#e1e3e5] bg-white/90 pl-12 pr-12 text-[12px] font-normal text-[#172238] shadow-[0_2px_5px_rgba(15,23,42,0.025)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#c9cdd2] focus:border-[#b88752] focus:ring-4 focus:ring-[#b88752]/[0.12]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-[calc(50%+4px)] -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb8954]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              {error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[10px] leading-relaxed text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-1 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[11px] bg-[#111c31] px-5 text-[11px] font-semibold tracking-[0.04em] text-white shadow-[0_7px_18px_rgba(17,28,49,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#243551] hover:shadow-[0_11px_24px_rgba(17,28,49,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb8954] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
                {!submitting && <ArrowRight size={15} strokeWidth={1.8} className="transition-transform duration-200 group-hover:translate-x-1" />}
              </button>
            </form>

            <Link href="/forgot-password" className="mt-4 inline-block text-[10px] font-medium text-[#a66a2c] hover:underline">
              Forgot your password?
            </Link>
            <div className="mt-4 text-[10px] text-slate-500">
              Planning a trip?{" "}
              <Link href="/destinations" className="font-medium text-[#a66a2c] hover:underline">Explore destinations</Link>
            </div>

            <div className="mt-7 flex items-start gap-3.5 rounded-[11px] border border-[#e5e3df] bg-white/75 p-4 shadow-[0_4px_14px_rgba(15,23,42,0.035)] sm:p-[18px]">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
                <ShieldCheck size={15} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-700">Private team access</div>
                <p className="mt-1.5 text-[9px] leading-[1.75] text-slate-500">
                  Your account is managed by your Rusetat administrator. Contact them if you need access.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex w-full max-w-[410px] flex-col items-start gap-2 border-t border-[#e6e2dc] pt-4 text-[8px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span>© {new Date().getFullYear()} Rusetat Migration &amp; Travel International</span>
            <span className="shrink-0 tracking-[0.08em]">SECURE WORKSPACE</span>
          </div>
        </section>
      </div>
    </main>
  );
}
