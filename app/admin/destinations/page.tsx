"use client";

import {
  ArrowUpRight,
  Check,
  CirclePlus,
  Edit3,
  ImagePlus,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { Destination } from "@/lib/types";

type DestinationForm = {
  name: string;
  country: string;
  heroImage: string;
  gallery: string;
  summary: string;
  highlights: string;
  visaNotes: string;
  itinerary: string;
  accommodations: string;
};

const emptyForm: DestinationForm = {
  name: "",
  country: "",
  heroImage: "",
  gallery: "",
  summary: "",
  highlights: "",
  visaNotes: "",
  itinerary: "",
  accommodations: "",
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c1874b] focus:ring-2 focus:ring-[#c1874b]/10";

function formFromDestination(destination: Destination): DestinationForm {
  return {
    name: destination.name,
    country: destination.country,
    heroImage: destination.heroImage,
    gallery: destination.gallery?.join("\n") ?? "",
    summary: destination.summary ?? "",
    highlights: destination.highlights.join("\n"),
    visaNotes: destination.visaNotes,
    itinerary: destination.defaultItinerary
      .map((day) => `${day.day} | ${day.title} | ${day.description}`)
      .join("\n"),
    accommodations: destination.accommodations
      .map((hotel) => `${hotel.name} | ${hotel.rating} | ${hotel.description} | ${hotel.image}`)
      .join("\n"),
  };
}

function parseDestination(form: DestinationForm, id?: string): Partial<Destination> {
  return {
    ...(id ? { id } : {}),
    name: form.name.trim(),
    country: form.country.trim(),
    heroImage: form.heroImage.trim(),
    gallery: form.gallery.split("\n").map((line) => line.trim()).filter(Boolean),
    summary: form.summary.trim(),
    highlights: form.highlights.split("\n").map((line) => line.trim()).filter(Boolean),
    visaNotes: form.visaNotes.trim(),
    defaultItinerary: form.itinerary
      .split("\n")
      .map((line, index) => {
        const [day, title, ...description] = line.split("|").map((part) => part.trim());
        return { day: Number(day) || index + 1, title: title ?? "", description: description.join(" | ") };
      })
      .filter((day) => day.title || day.description),
    accommodations: form.accommodations
      .split("\n")
      .map((line) => {
        const [name, rating, description, ...image] = line.split("|").map((part) => part.trim());
        return { name: name ?? "", rating: Number(rating) || 0, description: description ?? "", image: image.join(" | ") };
      })
      .filter((hotel) => hotel.name),
  };
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadDestinations() {
    const response = await fetch("/api/destinations");
    if (!response.ok) throw new Error("Unable to load destination library.");
    setDestinations((await response.json()) as Destination[]);
  }

  useEffect(() => {
    loadDestinations()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(destination: Destination) {
    setEditing(destination);
    setForm(formFromDestination(destination));
    setError("");
    setModalOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseDestination(form, editing?.id)),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to save destination.");
      }
      await loadDestinations();
      setModalOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save destination.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(destination: Destination) {
    if (!window.confirm(`Remove ${destination.name} from the destination library?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/destinations/${destination.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to remove destination.");
      }
      setDestinations((current) => current.filter((item) => item.id !== destination.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove destination.");
    }
  }

  const filtered = destinations.filter((destination) =>
    `${destination.name} ${destination.country}`.toLowerCase().includes(search.toLowerCase()),
  );
  const updateForm = (key: keyof DestinationForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <AppShell
      title="Destination library"
      subtitle="Your curated collection of places, experiences and stays."
      action={
        <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#101a2d] px-4 text-[11px] font-medium text-white transition hover:bg-[#243551]">
          <Plus size={15} /> Add destination
        </button>
      }
    >
      {error && !modalOpen && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">{error}</div>}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <MapPin size={14} className="text-[#b57738]" />
          <span><strong className="font-semibold text-slate-700">{destinations.length}</strong> destinations in your library</span>
        </div>
        <div className="relative w-full sm:w-[225px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search destinations..." className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[10px] outline-none focus:border-[#c1874b]" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-[11px] text-slate-400">Loading destination library...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe6] text-[#b57738]"><MapPin size={18} /></div>
          <p className="mt-4 text-[13px] font-medium text-slate-700">{search ? "No destinations found" : "Your library is ready to grow"}</p>
          <p className="mt-1 text-[10px] text-slate-400">{search ? "Try another place or country." : "Create reusable destination templates for your next client journey."}</p>
          {!search && <button onClick={openCreate} className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a66a2c]"><CirclePlus size={13} /> Add your first destination</button>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((destination) => (
            <article key={destination.id} className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-[172px] overflow-hidden">
                <img src={destination.heroImage} alt={destination.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="serif text-[23px]">{destination.name}</div>
                  <div className="mt-0.5 text-[10px] text-white/80">{destination.country}</div>
                </div>
                <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button onClick={() => openEdit(destination)} aria-label={`Edit ${destination.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm hover:text-[#a66a2c]"><Edit3 size={14} /></button>
                  <button onClick={() => remove(destination)} aria-label={`Delete ${destination.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-[34px] text-[10px] leading-[1.7] text-slate-500">{destination.summary || "A thoughtfully curated destination experience."}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {destination.highlights.slice(0, 3).map((highlight) => <span key={highlight} className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] text-slate-600">{highlight}</span>)}
                  {destination.highlights.length > 3 && <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] text-slate-500">+{destination.highlights.length - 3}</span>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-3 text-[9px] text-slate-400">
                    <span>{destination.defaultItinerary.length} suggested days</span>
                    <span>{destination.accommodations.length} stays</span>
                  </div>
                  <button onClick={() => openEdit(destination)} className="flex items-center gap-1 text-[9px] font-medium text-[#a66a2c] hover:underline">Edit template <ArrowUpRight size={11} /></button>
                </div>
              </div>
            </article>
          ))}
          <button onClick={openCreate} className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-[#c1874b] hover:bg-[#fdfaf7] hover:text-[#a66a2c]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Plus size={17} /></div>
            <span className="mt-3 text-[11px] font-medium">Add another destination</span>
            <span className="mt-1 text-[9px]">Build your destination library</span>
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/55 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="destination-modal-title" className="flex max-h-[92vh] w-full max-w-[740px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#ac7037]">MASTER CONTENT LIBRARY</div>
                <h2 id="destination-modal-title" className="serif mt-1 text-[21px] text-[#142039]">{editing ? "Edit destination" : "Create destination"}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button>
            </div>
            <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
              <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-medium text-slate-600">Destination name *
                    <input required className={fieldClass} placeholder="Cape Town" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600">Country *
                    <input required className={fieldClass} placeholder="South Africa" value={form.country} onChange={(event) => updateForm("country", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Hero image URL *
                    <div className="relative">
                      <ImagePlus size={14} className="absolute left-3 top-[18px] text-slate-400" />
                      <input required type="url" className={`${fieldClass} pl-9`} placeholder="https://..." value={form.heroImage} onChange={(event) => updateForm("heroImage", event.target.value)} />
                    </div>
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Gallery image URLs <span className="font-normal text-slate-400">(one URL per line)</span>
                    <textarea className={`${fieldClass} min-h-[54px] resize-y`} placeholder="https://..." value={form.gallery} onChange={(event) => updateForm("gallery", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Short summary
                    <textarea className={`${fieldClass} min-h-[65px] resize-y`} placeholder="What makes this destination special?" value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Travel highlights <span className="font-normal text-slate-400">(one per line)</span>
                    <textarea className={`${fieldClass} min-h-[80px] resize-y`} placeholder={"Table Mountain & the Cableway\nCape Peninsula"} value={form.highlights} onChange={(event) => updateForm("highlights", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Visa &amp; entry reminders
                    <textarea className={`${fieldClass} min-h-[80px] resize-y`} placeholder="Passport validity, visas, health requirements..." value={form.visaNotes} onChange={(event) => updateForm("visaNotes", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Suggested day-by-day itinerary <span className="font-normal text-slate-400">(one per line: day | title | description)</span>
                    <textarea className={`${fieldClass} min-h-[115px] resize-y font-mono text-[10px] leading-[1.8]`} placeholder={"1 | Arrival & city tour | Meet your driver and settle in.\n2 | Table Mountain | Take in the view from the top."} value={form.itinerary} onChange={(event) => updateForm("itinerary", event.target.value)} />
                  </label>
                  <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Recommended accommodation <span className="font-normal text-slate-400">(one per line: name | stars | description | image URL)</span>
                    <textarea className={`${fieldClass} min-h-[100px] resize-y font-mono text-[10px] leading-[1.8]`} placeholder={"The Cape Milner | 4 | A relaxed city retreat | https://..."} value={form.accommodations} onChange={(event) => updateForm("accommodations", event.target.value)} />
                  </label>
                </div>
                {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">{error}</div>}
              </div>
              <div className="flex justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-7">
                <button type="button" onClick={() => setModalOpen(false)} className="h-9 rounded-lg px-3 text-[10px] font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                <button disabled={saving} type="submit" className="flex h-9 items-center gap-2 rounded-lg bg-[#111c31] px-4 text-[10px] font-medium text-white transition hover:bg-[#243551] disabled:opacity-60">
                  <Check size={14} /> {saving ? "Saving..." : editing ? "Save changes" : "Create destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
