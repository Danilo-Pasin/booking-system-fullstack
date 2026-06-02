"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAccommodations } from "@/lib/api";

export default function HomePage() {
  const [accommodations, setAccommodations] = useState<any[]>([]);

  useEffect(() => {
    fetchAccommodations().then(setAccommodations).catch(() => {});
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">🏠 Booking System</h1>
      <p className="text-gray-500 mb-8">Encontre a acomodação perfeita</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((a: any) => (
          <Link key={a.id} href={`/accommodations/${a.id}`}>
            <div className="border rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-2xl mb-2">
                {a.type === "house" ? "🏡" : a.type === "apartment" ? "🏢" : "🛏️"}
              </div>
              <h2 className="font-semibold text-lg mb-1">{a.name}</h2>
              <p className="text-gray-500 text-sm capitalize mb-3">{a.type.replace("_", " ")}</p>
              <p className="text-blue-600 font-bold">${a.pricePerNight} <span className="text-gray-400 font-normal text-sm">/ noite</span></p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
          Login
        </Link>
        <Link href="/register" className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-center">
          Cadastrar
        </Link>
        <Link href="/bookings" className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-center">
          Minhas Reservas
        </Link>
      </div>
    </main>
  );
}