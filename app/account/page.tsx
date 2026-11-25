"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type AccountUser = { id: string; name: string; email: string; role: string };

const fieldClass =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]";

export default function AccountPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as { user?: AccountUser; error?: string };
        if (!response.ok || !body.user) throw new Error(body.error || "Unable to load account.");
        setUser(body.user);
        setName(body.user.name);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = (await response.json()) as { user?: AccountUser; error?: string };
      if (!response.ok || !body.user) throw new Error(body.error || "Unable to update profile.");
      setUser(body.user);
      setName(body.user.name);
      setNotice("Profile updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update profile.");
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to update password.");
      setCurrentPassword("");
      setNewPassword("");
      setNotice(body.message || "Password updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update password.");
    }
  }

  return (
    <AppShell title="My account" subtitle="Manage your workspace profile and password.">
      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] text-emerald-800">{notice}</div>}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 md:p-6">
          <h2 className="text-[12px] font-semibold text-slate-800">Profile details</h2>
          <p className="mt-1 text-[9px] text-slate-400">Your account email is used for sign-in and password recovery.</p>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <label className="block text-[10px] font-medium text-slate-600">
              Display name
              <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-[10px] font-medium text-slate-600">
              Work email
              <input readOnly value={user?.email ?? ""} className={`${fieldClass} bg-slate-50 text-slate-500`} />
            </label>
            <div className="text-[9px] text-slate-400">Role: {user?.role ?? "Loading..."}</div>
            <button className="h-9 rounded-lg bg-[#111c31] px-4 text-[10px] font-semibold text-white hover:bg-[#243551]">Save profile</button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 md:p-6">
          <h2 className="text-[12px] font-semibold text-slate-800">Change password</h2>
          <p className="mt-1 text-[9px] text-slate-400">Use at least 12 characters. You can also reset a forgotten password by email.</p>
          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <label className="block text-[10px] font-medium text-slate-600">
              Current password
              <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-[10px] font-medium text-slate-600">
              New password
              <input required minLength={12} maxLength={200} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={fieldClass} />
            </label>
            <button className="h-9 rounded-lg bg-[#111c31] px-4 text-[10px] font-semibold text-white hover:bg-[#243551]">Update password</button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
