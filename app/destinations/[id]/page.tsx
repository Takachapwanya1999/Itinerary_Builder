import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { getDestinations } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

async function findDestination(id: string) {
  const destinations = await getDestinations();
  return destinations.find((destination) => destination.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const destination = await findDestination(id);
  return {
    title: destination ? `${destination.name} | Rusetat` : "Destination | Rusetat",
    description: destination?.summary || "Explore a thoughtfully planned journey by Rusetat.",
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { id } = await params;
  const destination = await findDestination(id);
  if (!destination) notFound();

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#172238]">
      <header className="absolute inset-x-0 top-0 z-10 border-b border-white/15">
        <div className="mx-auto flex h-[76px] max-w-[1160px] items-center justify-between px-5 md:px-8">
          <Link href="/destinations" className="rounded-lg bg-[#101a2d]/80 px-2">
            <BrandLogo className="h-[54px] w-[170px] object-contain" />
          </Link>
          <Link href="/destinations/inquiry" className="rounded-lg bg-white px-4 py-2.5 text-[10px] font-semibold text-[#172238] hover:bg-[#f1e7da]">
            Plan this journey
          </Link>
        </div>
      </header>
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-[#111c31] md:min-h-[520px]">
        <img src={destination.heroImage} alt={destination.name} className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101a2d]/90 via-[#101a2d]/20 to-[#101a2d]/20" />
        <div className="relative mx-auto w-full max-w-[1160px] px-5 pb-12 text-white md:px-8 md:pb-16">
          <Link href="/destinations" className="mb-7 inline-flex items-center gap-1.5 text-[10px] text-white/75 hover:text-white"><ArrowLeft size={13} /> All destinations</Link>
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#efc58f]"><MapPin size={12} /> {destination.country}</div>
          <h1 className="serif mt-2 text-[42px] md:text-[60px]">{destination.name}</h1>
          <p className="mt-3 max-w-[620px] text-[12px] leading-relaxed text-white/75">{destination.summary}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-10 md:grid-cols-[1fr_300px] md:px-8 md:py-14">
        <div className="space-y-10">
          <section>
            <h2 className="serif text-[27px]">The highlights</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {destination.highlights.map((highlight) => <div key={highlight} className="rounded-lg border border-slate-200 bg-white p-4 text-[10px] text-slate-600">{highlight}</div>)}
            </div>
          </section>
          <section>
            <h2 className="serif text-[27px]">A few days, thoughtfully planned</h2>
            <div className="mt-4 space-y-3">
              {destination.defaultItinerary.map((day) => (
                <article key={day.day} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <span className="shrink-0 rounded-md bg-[#f7efe6] px-2.5 py-1 text-[9px] font-semibold text-[#9a612c]">DAY {day.day}</span>
                  <div><h3 className="text-[11px] font-semibold">{day.title}</h3><p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">{day.description}</p></div>
                </article>
              ))}
            </div>
          </section>
          {destination.accommodations.length > 0 && (
            <section>
              <h2 className="serif text-[27px]">Places to stay</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {destination.accommodations.map((stay) => (
                  <article key={stay.name} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="relative h-40 w-full overflow-hidden">
                      <img src={stay.image || destination.heroImage} alt={stay.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4"><h3 className="text-[11px] font-semibold">{stay.name}</h3><p className="mt-1.5 text-[10px] text-slate-500">{stay.description}</p></div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 md:sticky md:top-8">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a66a2c]">Make it yours</div>
          <h2 className="serif mt-2 text-[23px]">Let’s plan your journey.</h2>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Tell us what you have in mind and our team will help shape a trip around you.</p>
          <Link href={`/destinations/inquiry?destination=${encodeURIComponent(destination.name)}`} className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111c31] text-[10px] font-semibold text-white hover:bg-[#243551]">Ask a consultant <ArrowRight size={13} /></Link>
          {destination.visaNotes && <p className="mt-4 border-t border-slate-100 pt-4 text-[9px] leading-relaxed text-slate-400">{destination.visaNotes}</p>}
        </aside>
      </div>
      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-[9px] text-slate-400">Rusetat Migration &amp; Travel International · Thoughtfully planned, just for you.</footer>
    </main>
  );
}
