"use client";

import { UserPlus, Users, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { StaffUser } from "@/lib/types";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-[#c1874b]";

export default function TeamPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    const response = await fetch("/api/admin/team");
    const result = (await response.json()) as StaffUser[] | { error?: string };
    if (!response.ok) throw new Error("error" in result ? result.error : "Unable to load team accounts.");
    setUsers(result as StaffUser[]);
  }

  useEffect(() => {
    loadUsers()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as StaffUser | { error?: string };
      if (!response.ok) throw new Error("error" in result ? result.error : "Unable to create account.");
      setName("");
      setEmail("");
      setPassword("");
      setNotice("Consultant account created. Share the temporary password securely.");
      await loadUsers();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: StaffUser) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/team/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const result = (await response.json()) as StaffUser | { error?: string };
      if (!response.ok) throw new Error("error" in result ? result.error : "Unable to update account.");
      await loadUsers();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update account.");
    }
  }

  return (
    <AppShell
      title="Team access"
      subtitle="Invite consultants and manage who can access your workspace."
    >
      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] text-emerald-800">{notice}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7efe6] text-[#a66a2c]"><UserPlus size={16} /></div>
            <div>
              <h2 className="text-[12px] font-semibold text-slate-800">Add a consultant</h2>
              <p className="mt-1 text-[9px] text-slate-400">New accounts receive workspace access immediately.</p>
            </div>
          </div>
          <form onSubmit={createAccount} className="mt-5 space-y-4">
            <label className="block text-[10px] font-medium text-slate-600">Full name
              <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="Consultant name" />
            </label>
            <label className="block text-[10px] font-medium text-slate-600">Work email
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} placeholder="consultant@rusetat.com" />
            </label>
            <label className="block text-[10px] font-medium text-slate-600">Temporary password <span className="font-normal text-slate-400">(at least 12 characters)</span>
              <input required minLength={12} maxLength={200} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} placeholder="Share securely with the consultant" />
            </label>
            <button disabled={saving} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111c31] px-4 text-[10px] font-semibold text-white hover:bg-[#243551] disabled:opacity-60">
              <UserPlus size={13} /> {saving ? "Creating account..." : "Create consultant account"}
            </button>
          </form>
          <p className="mt-4 text-[9px] leading-relaxed text-slate-400">Passwords are stored as salted bcrypt hashes. There is no public registration.</p>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-[12px] font-semibold text-slate-800">Workspace accounts</h2>
              <p className="mt-1 text-[9px] text-slate-400">{users.length} account{users.length === 1 ? "" : "s"}</p>
            </div>
            <Users size={16} className="text-slate-400" />
          </div>
          {loading ? (
            <p className="px-5 py-10 text-center text-[10px] text-slate-400">Loading accounts...</p>
          ) : users.length === 0 ? (
            <p className="px-5 py-10 text-center text-[10px] text-slate-400">No accounts found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e7da] text-[10px] font-semibold text-[#75532f]">
                    {user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-medium text-slate-800">{user.name}</div>
                    <div className="mt-0.5 truncate text-[9px] text-slate-400">{user.email}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[8px] font-medium ${user.role === "admin" ? "bg-[#f7efe6] text-[#9a612c]" : "bg-slate-100 text-slate-600"}`}>
                    {user.role}
                  </span>
                  <span className={`hidden rounded-full px-2 py-1 text-[8px] sm:inline-flex ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {user.role !== "admin" && (
                    <button
                      onClick={() => toggleActive(user)}
                      title={user.isActive ? "Deactivate account" : "Activate account"}
                      aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.name}`}
                      className={`rounded-md p-2 transition ${user.isActive ? "text-slate-400 hover:bg-red-50 hover:text-red-600" : "text-emerald-600 hover:bg-emerald-50"}`}
                    >
                      <UserX size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
