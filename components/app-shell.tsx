"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  LogOut,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useRouter } from "next/navigation";
import type { StaffUser } from "@/lib/types";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/builder", label: "Itinerary builder", icon: Sparkles },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/account", label: "My account", icon: Settings },
];

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [user, setUser] = useState<Pick<StaffUser, "name" | "email" | "role"> | null>(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/signin");
          return;
        }
        if (!response.ok) throw new Error("Unable to load your account details.");
        const result = (await response.json()) as { user?: Pick<StaffUser, "name" | "email" | "role"> };
        if (result.user) setUser(result.user);
      })
      .catch((reason: Error) => setAuthError(reason.message));
  }, []);

  async function signOut() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      router.replace("/signin");
      router.refresh();
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "Unable to sign out.");
    }
  }

  const visibleLinks =
    user?.role === "admin"
      ? [...links, { href: "/admin/team", label: "Team access", icon: Users }]
      : links;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col bg-[#101a2d] text-white transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="relative flex items-center px-4 py-5">
          <BrandLogo className="h-[68px] w-full object-contain" />
          <button
            aria-label="Close menu"
            className="absolute right-4 top-4 rounded-lg bg-[#101a2d]/80 p-2 text-slate-300 lg:hidden"
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </Link>

        <div className="px-4 pt-7">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </div>
          <nav className="space-y-1">
            {visibleLinks.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {label}
                  {label === "Itinerary builder" && (
                    <span className="ml-auto rounded-full bg-[#d97706] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#e5b47a]">
              <Sparkles size={14} /> A little inspiration
            </div>
            <p className="text-[11px] leading-[1.65] text-slate-400">
              Thoughtful journeys begin with the details that matter.
            </p>
            <Link
              href="/builder"
              className="mt-4 flex items-center gap-1 text-[11px] font-medium text-white hover:text-[#e5b47a]"
            >
              Create a proposal <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6d4bb] text-[11px] font-semibold text-[#38291b]">
              {user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "RT"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium">{user?.name ?? "Rusetat team"}</div>
              <div className="mt-0.5 truncate text-[10px] text-slate-500">{user?.email ?? "Staff workspace"}</div>
            </div>
            <button onClick={signOut} title="Sign out" aria-label="Sign out" className="rounded-md p-1.5 text-slate-500 hover:bg-white/10 hover:text-white">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md md:px-9">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={19} />
            </button>
            <form
              className="relative hidden sm:block"
              onSubmit={(event) => {
                event.preventDefault();
                const query = globalSearch.trim();
                router.push(query ? `/proposals?q=${encodeURIComponent(query)}` : "/proposals");
              }}
            >
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                aria-label="Search proposals"
                placeholder="Search proposals..."
                className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12px] outline-none transition focus:border-[#d97706] focus:bg-white"
              />
            </form>
            <div className="text-[11px] text-slate-400 sm:hidden">Rusetat workspace</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-slate-500 md:block">
              Rusetat Migration &amp; Travel International
            </span>
            <Link
              href="/builder"
              className="flex h-9 items-center gap-2 rounded-lg bg-[#101a2d] px-3.5 text-[11px] font-medium text-white transition hover:bg-[#243551]"
            >
              <Plus size={14} /> <span className="hidden sm:inline">New proposal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1390px] px-5 py-8 md:px-9 md:py-10">
          {authError && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">{authError}</div>}
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#a66a2c]">
                <span className="h-px w-5 bg-[#d97706]" />
                Rusetat workspace
              </div>
              <h1 className="serif text-[29px] font-medium tracking-[-0.025em] text-[#111a2b] md:text-[34px]">
                {title}
              </h1>
              {subtitle && <p className="mt-1.5 text-[12px] text-slate-500">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
