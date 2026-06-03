"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchBookings, cancelBooking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { formatCurrency } from "@/lib/currency";
import { getErrorMessage } from "@/lib/errors";
import type { Booking } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function BookingsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function loadBookings() {
    if (!token) return;
    try {
      const data = await fetchBookings(token);
      setBookings(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoading) return;
    loadBookings();
  }, [user, token, isLoading]);

  async function handleCancel(id: string) {
    if (!token) return;
    setCancelling(id);
    setConfirmId(null);
    try {
      await cancelBooking(id, token);
      toast.success("Reserva cancelada!");
      setLoading(true);
      await loadBookings();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(null);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <Skeleton className="h-8 w-48 mb-8" />
        {[1, 2].map((n) => (
          <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 mb-4 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <Breadcrumbs />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Minhas Reservas</h1>
            <p className="text-zinc-500 mt-1">Gerencie suas estadias</p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Explorar acomodações
          </Link>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {bookings.length === 0 && !error && (
          <EmptyState
            icon="📋"
            title="Nenhuma reserva encontrada."
            actionLabel="Explorar acomodações"
            actionHref="/"
          />
        )}

        <div className="flex flex-col gap-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-lg text-white">{b.accommodation.name}</h2>
                    <span className="text-zinc-500 text-sm capitalize">{b.accommodation.type.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm mb-4">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Entrada: <strong className="text-white">{new Date(b.checkIn).toLocaleDateString("pt-BR")}</strong></span>
                  </div>
                  <span className="hidden sm:inline text-zinc-700">→</span>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Saída: <strong className="text-white">{new Date(b.checkOut).toLocaleDateString("pt-BR")}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <p className="text-blue-400 font-bold text-lg">
                    Total: {formatCurrency(b.totalPrice)}
                  </p>
                  <button
                    onClick={() => setConfirmId(b.id)}
                    disabled={cancelling === b.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                  >
                    {cancelling === b.id ? "Cancelando..." : "Cancelar reserva"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ConfirmModal
          open={confirmId !== null}
          title="Cancelar reserva"
          message="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
          confirmLabel={cancelling === confirmId ? "Cancelando..." : "Confirmar cancelamento"}
          cancelLabel="Manter reserva"
          loading={cancelling === confirmId}
          variant="danger"
          onConfirm={() => confirmId && handleCancel(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      </main>
    </ProtectedRoute>
  );
}
