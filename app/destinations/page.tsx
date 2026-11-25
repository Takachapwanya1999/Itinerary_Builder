import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getDestinations } from "@/lib/store";

export const metadata: Metadata = {
  title: "Destinations | Rusetat",
  description: "Explore thoughtfully curated destinations and journeys by Rusetat.",
};

export default async function PublicDestinationsPage() {
  const destinations = await getDestinations();
  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#172238]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1160px] items-center justify-between px-5 md:px-8">
          <Link href="/destinations" className="rounded-lg bg-[#101a2d] px-2">
            <BrandLogo className="h-[54px] w-[170px] object-contain" />
          </Link>
          <Link href="/destinations/inquiry" className="rounded-lg bg-[#101a2d] px-4 py-2.5 text-[10px] font-medium text-white hover:bg-[#243551]">
            Plan a journey
          </Link>
        </div>
      </header>
      <section className="relative overflow-hidden bg-[#111c31] px-5 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(211,160,103,0.22),transparent_35%)]" />
        <div className="relative mx-auto max-w-[1160px]">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e9bc83]"><MapPin size={13} /> Explore with Rusetat</div>
          <h1 className="serif mt-4 max-w-[700px] text-[42px] leading-tight md:text-[58px]">Places that stay with you.</h1>
          <p className="mt-4 max-w-[570px] text-[12px] leading-relaxed text-white/65">Discover remarkable places across Africa and beyond. Each journey is thoughtfully tailored to the people taking it.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1160px] px-5 py-12 md:px-8 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a66a2c]">The collection</div>
            <h2 className="serif mt-1.5 text-[28px]">Find your somewhere</h2>
          </div>
          <span className="text-[10px] text-slate-400">{destinations.length} destinations</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link key={destination.id} href={`/destinations/${encodeURIComponent(destination.id)}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-[225px] overflow-hidden bg-slate-200">
                <img src={destination.heroImage} alt={destination.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[9px] font-medium uppercase tracking-wide text-white/75">{destination.country}</span>
                  <h3 className="serif mt-1 text-[24px]">{destination.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-[38px] text-[10px] leading-relaxed text-slate-500">{destination.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a66a2c]">Explore destination <ArrowRight size={13} /></span>
              </div>
            </Link>
          ))}
        </div>
        {destinations.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-[11px] text-slate-500">Our destination collection is being prepared. Please check back soon.</p>}
      </section>
      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-[9px] text-slate-400">Rusetat Migration &amp; Travel International · Thoughtfully planned, just for you.</footer>
    </main>
  );
}
