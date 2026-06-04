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
      className="group border rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 bg-card"
    >
      <div className="h-48 overflow-hidden bg-muted">
        {a.images?.[0]?.url ?? a.imageUrl ? (
          <img
            src={a.images?.[0]?.url ?? a.imageUrl}
            alt={a.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement!;
              const fallback = document.createElement("div");
              fallback.className = "w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-muted to-muted/80";
              fallback.textContent = typeIcon(a.type);
              parent.appendChild(fallback);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-muted to-muted/80">
            {typeIcon(a.type)}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {typeLabel(a.type)}
          </span>
          <span className="text-blue-600 font-bold text-lg">
            {formatCurrency(a.pricePerNight)}
            <span className="text-muted-foreground font-normal text-xs ml-1">/ noite</span>
          </span>
        </div>
        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-4">
          {a.name}
        </h3>
        <div className="inline-flex items-center justify-center gap-2 w-full border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">
          Ver detalhes
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
