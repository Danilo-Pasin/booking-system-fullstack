"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { previewPrice, createBooking, fetchAccommodations } from "@/lib/api";

export default function AccommodationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<any>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);

  useEffect(() => {
    fetchAccommodations().then((list: any[]) => {
      setAccommodation(list.find(a => a.id === id));
    });
  }, [id]);

  async function handlePreview() {
    if (!checkIn || !checkOut) return;
    setLoadingPreview(true);
    const data = await previewPrice(id as string, checkIn, checkOut);
    if (data.error) { setError(data.error); toast.error(data.error); setLoadingPreview(false); return; }
    setPreview(data);
    setError("");
    setLoadingPreview(false);
  }

  async function handleBook() {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setLoadingBook(true);
    const data = await createBooking(id as string, checkIn, checkOut, token);
    if (data.error) { toast.error(data.error); setLoadingBook(false); return; }
    setSuccess(true);
    toast.success("Reserva confirmada!");
    setLoadingBook(false);
  }

  if (!accommodation) return <p className="p-8">Carregando...</p>;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">{accommodation.name}</h1>
      <p className="text-gray-500 capitalize mb-6">{accommodation.type.replace("_", " ")}</p>
      <p className="text-blue-600 font-bold text-xl mb-8">${accommodation.pricePerNight} / noite</p>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-semibold text-lg">✅ Reserva confirmada!</p>
          <button onClick={() => router.push("/bookings")} className="mt-4 text-blue-600 underline">
            Ver minhas reservas
          </button>
        </div>
      ) : (
        <div className="border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Fazer reserva</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="text-sm text-gray-500">Check-in</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full mt-1" />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-500">Check-out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full mt-1" />
            </div>
          </div>
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="border py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPreview ? "Calculando..." : "Ver preço"}
          </button>
          {preview && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p>Base: <strong>${preview.base.toFixed(2)}</strong></p>
              {preview.fees.map((f: any) => (
                <p key={f.name}>{f.name}: <strong>${f.amount.toFixed(2)}</strong></p>
              ))}
              <p className="text-blue-600 font-bold mt-2">Total: ${preview.total.toFixed(2)}</p>
            </div>
          )}
          {preview && (
            <button
              onClick={handleBook}
              disabled={loadingBook}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingBook ? "Reservando..." : "Confirmar reserva"}
            </button>
          )}
        </div>
      )}
    </main>
  );
}