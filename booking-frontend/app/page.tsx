"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchAccommodations } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AccommodationCard from "@/components/AccommodationCard";
import type { Accommodation } from "@/lib/types";

export default function HomePage() {
  const { user } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("none");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAccommodations()
      .then((data) => setAccommodations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...accommodations];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }

    if (sort === "price_asc") result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === "price_desc") result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (sort === "name_asc") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [accommodations, search, typeFilter, sort]);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-zinc-900 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E\")", backgroundSize: "60px 60px" }} />
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <svg width="320" height="320" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
            <rect x="7" y="13" width="3" height="3" rx="0.5" />
            <rect x="14" y="13" width="3" height="3" rx="0.5" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center relative">
          {!loading && (
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {accommodations.length} {accommodations.length === 1 ? "acomodação disponível" : "acomodações disponíveis"}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Encontre sua
            <span className="text-blue-400"> estadia perfeita</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Sistema de reservas acadêmico — explore casas, apartamentos e quartos
            compartilhados com preços transparentes e sem surpresas.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="relative">
              <div className="flex">
                <Link
                  href="#accommodations"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-l-xl font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-500/25"
                >
                  Explorar acomodações
                </Link>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-blue-600 text-white px-3 py-4 rounded-r-xl font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-500/25 border-l border-blue-500"
                  aria-label="Mais opções"
                >
                  <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                    <Link
                      href="#accommodations"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 transition text-sm"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explorar acomodações
                    </Link>
                    <Link
                      href={user ? (user.role === "HOST" ? "/host" : "/profile") : "/login"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 transition text-sm border-t border-zinc-800"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {user ? "Painel do Anfitrião" : "Tornar-se um anfitrião"}
                    </Link>
                  </div>
                </>
              )}
            </div>
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition"
              >
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="accommodations" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Acomodações disponíveis</h2>
            <p className="text-zinc-500 mt-1">
              Mostrando {filtered.length} de {accommodations.length}{" "}
              {accommodations.length === 1 ? "acomodação" : "acomodações"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm w-full sm:w-64"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">Todos os tipos</option>
              <option value="house">Casa</option>
              <option value="apartment">Apartamento</option>
              <option value="shared_room">Quarto Compartilhado</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="none">Ordenar por</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="name_asc">Nome A-Z</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-zinc-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-5 bg-zinc-800 rounded w-2/3" />
                  <div className="h-4 bg-zinc-800 rounded w-1/4" />
                  <div className="h-10 bg-zinc-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-lg">
              {search || typeFilter !== "all"
                ? "Nenhuma acomodação encontrada com esses filtros."
                : "Nenhuma acomodação disponível no momento."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <AccommodationCard key={a.id} accommodation={a} />
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-800 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-1">Reservas seguras</h4>
              <p className="text-zinc-500 text-sm">Autenticação JWT para proteger seus dados</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold mb-1">Preços transparentes</h4>
              <p className="text-zinc-500 text-sm">Breakdown completo de taxas e descontos</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏷️</div>
              <h4 className="font-semibold mb-1">Desconto progressivo</h4>
              <p className="text-zinc-500 text-sm">10% off em estadias com mais de 7 dias</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
