"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchBookings, cancelBooking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ConfirmModal";

type BookingWithMeta = Booking & { _isHistory?: boolean };

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: "⏳ Aguardando aprovação", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  APPROVED:  { label: "✅ Confirmada",           classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  REJECTED:  { label: "❌ Recusada",             classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  CANCELED:  { label: "🚫 Cancelada",            classes: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cfg.classes)}>
      {cfg.label}
    </span>
  );
}

function BookingSkeleton() {
  return (
    <div className="border rounded-2xl p-5 sm:p-6 space-y-4 bg-card">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
  );
}

export default function BookingsPage() {
  const { token, isLoading } = useAuth();
  const [allBookings, setAllBookings] = useState<BookingWithMeta[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !token) return;
    fetchBookings(token)
      .then((data) => setAllBookings(data))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isLoading, token]);

  const activeBookings = allBookings.filter(
    (b) => b.status === "PENDING" || b.status === "APPROVED",
  );
  const historyBookings = allBookings.filter(
    (b) => b.status === "REJECTED" || b.status === "CANCELED" || (b.status && !["PENDING", "APPROVED", "REJECTED", "CANCELED"].includes(b.status)),
  );

  async function handleCancel(id: string) {
    if (!token) return;
    setCancelling(id);
    setConfirmId(null);

    const previous = allBookings;
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELED" } : b)),
    );

    try {
      await cancelBooking(id, token);
      toast.success("Reserva cancelada com sucesso!");
    } catch (err: unknown) {
      setAllBookings(previous);
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(null);
    }
  }

  if (isLoading || loading) {
    return (
      <ProtectedRoute>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <Breadcrumbs />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => <BookingSkeleton key={n} />)}
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs />

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Minhas Reservas</h1>
            <p className="text-muted-foreground mt-1">
              {activeBookings.length > 0
                ? `${activeBookings.length} ${activeBookings.length === 1 ? "reserva ativa" : "reservas ativas"}`
                : "Gerencie suas estadias"}
            </p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500 transition font-medium">
            Explorar acomodações &rarr;
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {allBookings.length === 0 && !error && (
          <div className="border-2 border-dashed border-border rounded-2xl py-20 px-6 text-center hover:border-muted-foreground/30 transition">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-1">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Você ainda não fez nenhuma reserva. Explore as acomodações disponíveis e planeje sua estadia.
            </p>
            <Button asChild>
              <Link href="/">Explorar acomodações</Link>
            </Button>
          </div>
        )}

        {activeBookings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Reservas Ativas
            </h2>
            <div className="flex flex-col gap-4">
              {activeBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  cancelling={cancelling}
                  onCancel={setConfirmId}
                />
              ))}
            </div>
          </section>
        )}

        {historyBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
              Histórico
            </h2>
            <div className="flex flex-col gap-4 opacity-70">
              {historyBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  cancelling={cancelling}
                  onCancel={setConfirmId}
                />
              ))}
            </div>
          </section>
        )}

        <ConfirmModal
          open={confirmId !== null}
          title="Cancelar reserva"
          message="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
          confirmLabel={cancelling === confirmId ? "Cancelando..." : "Sim, cancelar reserva"}
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

function BookingCard({
  booking: b,
  cancelling,
  onCancel,
}: {
  booking: BookingWithMeta;
  cancelling: string | null;
  onCancel: (id: string) => void;
}) {
  const canCancel = isCancellable(b.status);

  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden transition bg-card",
        b.status === "PENDING" && "border-yellow-300/50",
        b.status === "APPROVED" && "border-green-300/50",
        canCancel && "hover:border-muted-foreground/30",
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">{b.accommodation.name}</h2>
            <span className="text-muted-foreground text-sm capitalize">
              {b.accommodation.type.replace("_", " ")}
            </span>
          </div>
          <StatusBadge status={b.status ?? "UNKNOWN"} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Entrada: <strong>{new Date(b.checkIn).toLocaleDateString("pt-BR")}</strong></span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/50">&rarr;</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Saída: <strong>{new Date(b.checkOut).toLocaleDateString("pt-BR")}</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-blue-600 font-bold text-lg">
            Total: {formatCurrency(b.totalPrice)}
          </p>
          {canCancel && (
            <Button
              onClick={() => onCancel(b.id)}
              disabled={cancelling === b.id}
              variant="destructive"
              size="sm"
            >
              {cancelling === b.id ? "Cancelando..." : "Cancelar reserva"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function isCancellable(status?: string) {
  return status === "PENDING";
}
