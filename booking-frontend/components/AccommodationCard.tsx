import Link from "next/link";
import { typeIcon, typeLabel } from "@/lib/accommodation";
import { formatCurrency } from "@/lib/currency";
import type { Accommodation } from "@/lib/types";

type Props = {
  accommodation: Accommodation;
};

export default function AccommodationCard({ accommodation: a }: Props) {
  return (
    <Link
      key={a.id}
      href={`/accommodations/${a.id}`}
      className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] transition-all duration-300"
    >
      <div className="h-48 overflow-hidden bg-zinc-800">
        {a.images?.[0]?.url ?? a.imageUrl ? (
          <img
            src={a.images?.[0]?.url ?? a.imageUrl}
            alt={a.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-zinc-800 to-zinc-900">
            {typeIcon(a.type)}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {typeLabel(a.type)}
          </span>
          <span className="text-blue-400 font-bold text-lg">
            {formatCurrency(a.pricePerNight)}
            <span className="text-zinc-500 font-normal text-xs ml-1">/ noite</span>
          </span>
        </div>
        <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors mb-4">
          {a.name}
        </h3>
        <div className="inline-flex items-center justify-center gap-2 w-full border border-zinc-700 text-zinc-300 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition">
          Ver detalhes
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
