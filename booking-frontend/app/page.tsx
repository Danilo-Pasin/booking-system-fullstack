"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import FeaturedAccommodations from "@/components/FeaturedAccommodations";
import BenefitsSection from "@/components/BenefitsSection";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='black' stroke-width='0.5'/%3E%3C/svg%3E\")", backgroundSize: "60px 60px" }} />
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <svg width="320" height="320" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
            <rect x="7" y="13" width="3" height="3" rx="0.5" />
            <rect x="14" y="13" width="3" height="3" rx="0.5" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Encontre sua
            <span className="text-blue-600"> estadia perfeita</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Sistema de reservas acadêmico — explore casas, apartamentos e quartos
            compartilhados com preços transparentes e sem surpresas.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/accommodations"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-500/25"
            >
              Explorar acomodações
            </Link>
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border px-6 py-3 rounded-xl font-medium hover:bg-muted transition"
              >
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
      </section>

      <FeaturedAccommodations />
      <BenefitsSection />
    </main>
  );
}
