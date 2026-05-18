"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchBookings } from "@/lib/api";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchBookings(token).then(data => {
      if (data.error) { setError(data.error); return; }
      setBookings(data);
    });
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Minhas Reservas</h1>
      {error && <p className="text-red-500">{error}</p>}
      {bookings.length === 0 && !error && <p className="text-gray-500">Nenhuma reserva encontrada.</p>}
      <div className="flex flex-col gap-4">
        {bookings.map(b => (
          <div key={b.id} className="border rounded-xl p-6">
            <h2 className="font-semibold text-lg">{b.accommodation.name}</h2>
            <p className="text-gray-500 text-sm capitalize">{b.accommodation.type.replace("_", " ")}</p>
            <div className="flex gap-6 mt-3 text-sm">
              <p>Check-in: <strong>{new Date(b.checkIn).toLocaleDateString("pt-BR")}</strong></p>
              <p>Check-out: <strong>{new Date(b.checkOut).toLocaleDateString("pt-BR")}</strong></p>
            </div>
            <p className="text-blue-600 font-bold mt-2">Total: R${b.totalPrice.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}