"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAccommodations } from "@/lib/api";
import AccommodationCard from "@/components/AccommodationCard";
import type { Accommodation } from "@/lib/types";

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function FeaturedAccommodations() {
  const [featured, setFeatured] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccommodations()
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        setFeatured(pickRandom(all, Math.min(6, all.length)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Acomodações em destaque</h2>
          <p className="text-muted-foreground mt-1">Opções selecionadas para você</p>
        </div>
        <Link
          href="/accommodations"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium transition"
        >
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((a) => (
          <AccommodationCard key={a.id} accommodation={a} />
        ))}
      </div>
    </section>
  );
}
