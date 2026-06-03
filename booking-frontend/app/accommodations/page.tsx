"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchAccommodations } from "@/lib/api";
import AccommodationCard from "@/components/AccommodationCard";
import AccommodationFilters from "@/components/AccommodationFilters";
import type { Accommodation } from "@/lib/types";
import type { Filters } from "@/components/AccommodationFilters";

function AccommodationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: Filters = {
    search: searchParams.get("search") ?? "",
    type: searchParams.get("type") ?? "all",
    sort: searchParams.get("sort") ?? "none",
  };

  function onFilterChange(newFilters: Filters) {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.type && newFilters.type !== "all") params.set("type", newFilters.type);
    if (newFilters.sort && newFilters.sort !== "none") params.set("sort", newFilters.sort);

    const qs = params.toString();
    router.push(`/accommodations${qs ? `?${qs}` : ""}`);
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.sort && filters.sort !== "none") params.set("sort", filters.sort);
    const qs = params.toString();

    fetchAccommodations(qs ? `?${qs}` : undefined)
      .then((data) => setAccommodations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  return (
    <main>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Todas as acomodações</h1>
            <p className="text-muted-foreground mt-1">
              {loading
                ? "Carregando..."
                : `${accommodations.length} ${accommodations.length === 1 ? "acomodação encontrada" : "acomodações encontradas"}`}
            </p>
          </div>

          <AccommodationFilters filters={filters} onChange={onFilterChange} />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border rounded-2xl overflow-hidden animate-pulse bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && accommodations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {filters.search || filters.type !== "all"
                ? "Nenhuma acomodação encontrada com esses filtros."
                : "Nenhuma acomodação disponível no momento."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodations.map((a) => (
            <AccommodationCard key={a.id} accommodation={a} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function AccommodationsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-12 text-center text-muted-foreground">Carregando...</div>}>
      <AccommodationsContent />
    </Suspense>
  );
}
