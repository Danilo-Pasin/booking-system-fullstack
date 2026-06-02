"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchBookings, cancelBooking } from "@/lib/api";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function loadBookings() {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const data = await fetchBookings(token);
    if (data.error) { setError(data.error); setLoading(false); return; }
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setCancelling(id);
    try {
      await cancelBooking(id, token);
      toast.success("Reserva cancelada!");
      await loadBookings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <p className="p-8">Carregando reservas...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Minhas Reservas</h1>
      {error && <p className="text-red-500">{error}</p>}
      {bookings.length === 0 && !error && <p className="text-gray-500">Nenhuma reserva encontrada.</p>}
      <div className="flex flex-col gap-4">
        {bookings.map(b => (
          <div key={b.id} className="border rounded-xl p-6">
            <h2 className="font-semibold text-lg">{b.accommodation.name}</h2>
            <p className="text-gray-500 text-sm capitalize mb-3">{b.accommodation.type.replace("_", " ")}</p>
            <div className="flex gap-6 text-sm flex-col sm:flex-row mb-4">
              <p>Check-in: <strong>{new Date(b.checkIn).toLocaleDateString("pt-BR")}</strong></p>
              <p>Check-out: <strong>{new Date(b.checkOut).toLocaleDateString("pt-BR")}</strong></p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-blue-600 font-bold">Total: R${b.totalPrice.toFixed(2)}</p>
              <button
                onClick={() => handleCancel(b.id)}
                disabled={cancelling === b.id}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {cancelling === b.id ? "Cancelando..." : "Cancelar reserva"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}