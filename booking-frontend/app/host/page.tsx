"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchMyAccommodations, deleteAccommodation, fetchHostDashboard, fetchHostBookings, updateBookingStatus } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import MetricCard from "@/components/MetricCard";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { typeLabel } from "@/lib/accommodation";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { Accommodation, HostBooking } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: "⏳ Pendente",            classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  APPROVED:  { label: "✅ Confirmada",          classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  REJECTED:  { label: "❌ Recusada",            classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  CANCELED:  { label: "🚫 Cancelada",           classes: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cfg.classes)}>
      {cfg.label}
    </span>
  );
}

export default function HostPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [dashboard, setDashboard] = useState<{ accommodationsCount: number; bookingsCount: number; estimatedRevenue: number } | null>(null);
  const [pendingBookings, setPendingBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [accData, dashData, hostBookings] = await Promise.all([
        fetchMyAccommodations(token),
        fetchHostDashboard(token),
        fetchHostBookings(token),
      ]);
      setAccommodations(accData);
      setDashboard({ accommodationsCount: dashData.accommodationsCount, bookingsCount: dashData.bookingsCount, estimatedRevenue: dashData.estimatedRevenue });
      setBookings(hostBookings);
      setPendingBookings(hostBookings.filter(b => b.status === "PENDING"));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "HOST") { router.push("/"); return; }
    if (!token) return;
    Promise.all([
      fetchMyAccommodations(token),
      fetchHostDashboard(token),
      fetchHostBookings(token),
    ])
      .then(([accData, dashData, hostBookings]) => {
        setAccommodations(accData);
        setDashboard({
          accommodationsCount: dashData.accommodationsCount,
          bookingsCount: dashData.bookingsCount,
          estimatedRevenue: dashData.estimatedRevenue,
        });
        setBookings(hostBookings);
        setPendingBookings(hostBookings.filter(b => b.status === "PENDING"));
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user, token, isLoading, router]);

  async function handleDelete(id: string) {
    if (!token) return;
    setDeleting(id);
    try {
      await deleteAccommodation(id, token);
      toast.success("Acomodação excluída!");
      setConfirmId(null);
      await load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  }

  async function handleApprove(bookingId: string) {
    if (!token) return;
    setProcessingStatus(bookingId);
    try {
      await updateBookingStatus(bookingId, "APPROVED", token);
      toast.success("Reserva aprovada!");
      await load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingStatus(null);
    }
  }

  async function handleReject(bookingId: string) {
    if (!token) return;
    setProcessingStatus(bookingId);
    try {
      await updateBookingStatus(bookingId, "REJECTED", token);
      toast.success("Reserva recusada.");
      await load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingStatus(null);
    }
  }

  if (isLoading || loading) {
    return (
      <ProtectedRoute>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-5 w-32 mb-8" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border rounded-2xl p-5 h-24 bg-card" />
            ))}
          </div>
          {[1, 2].map((n) => (
            <div key={n} className="border rounded-2xl p-5 mb-4 h-36 bg-card" />
          ))}
        </main>
      </ProtectedRoute>
    );
  }

  const activeBookings = bookings.filter(b => b.status === "APPROVED" || b.status === "PENDING");
  const historyBookings = bookings.filter(b => b.status === "REJECTED" || b.status === "CANCELED");

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel do Host</h1>
            <p className="text-muted-foreground mt-1">
              {accommodations.length} {accommodations.length === 1 ? "acomodação cadastrada" : "acomodações cadastradas"}
            </p>
          </div>
          <Button asChild>
            <Link href="/host/new">+ Nova acomodação</Link>
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <MetricCard label="Acomodações" value={dashboard.accommodationsCount} />
            <MetricCard label="Reservas Ativas" value={dashboard.bookingsCount} />
            <MetricCard
              label="Receita Estimada"
              value={formatCurrency(dashboard.estimatedRevenue)}
              valueClassName="text-green-600"
            />
          </div>
        )}

        {/* Pending bookings with approve/reject */}
        {pendingBookings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
              Solicitações Pendentes
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingBookings.length}
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {pendingBookings.map((pb) => (
                <div key={pb.id} className="border border-yellow-300/50 rounded-2xl p-5 bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-lg">{pb.userName || "Hóspede"}</p>
                      {pb.userEmail && <p className="text-muted-foreground text-xs">{pb.userEmail}</p>}
                      <p className="text-muted-foreground text-sm mt-1">{pb.accommodation.name}</p>
                    </div>
                    <p className="text-blue-600 font-bold text-lg shrink-0 ml-4">{formatCurrency(pb.totalPrice)}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {new Date(pb.checkIn).toLocaleDateString("pt-BR")} → {new Date(pb.checkOut).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(pb.id)}
                      disabled={processingStatus === pb.id}
                      className="flex-1"
                    >
                      {processingStatus === pb.id ? "Processando..." : "Aprovar"}
                    </Button>
                    <Button
                      onClick={() => handleReject(pb.id)}
                      disabled={processingStatus === pb.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processingStatus === pb.id ? "Processando..." : "Recusar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All host bookings */}
        {activeBookings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Reservas Confirmadas
            </h2>
            <div className="flex flex-col gap-3">
              {activeBookings.map((b) => (
                <div key={b.id} className="border rounded-2xl p-5 bg-card">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-lg">{b.userName || "Hóspede"}</p>
                      {b.userEmail && <p className="text-muted-foreground text-xs">{b.userEmail}</p>}
                      <p className="text-muted-foreground text-sm mt-1">{b.accommodation.name}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-blue-600 font-bold">{formatCurrency(b.totalPrice)}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <hr className="border-t my-3" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Entrada: <strong>{new Date(b.checkIn).toLocaleDateString("pt-BR")}</strong></span>
                    </div>
                    <span className="hidden sm:inline text-muted-foreground/30">&rarr;</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Saída: <strong>{new Date(b.checkOut).toLocaleDateString("pt-BR")}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {historyBookings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
              Histórico de Reservas
            </h2>
            <div className="flex flex-col gap-3 opacity-60">
              {historyBookings.map((b) => (
                <div key={b.id} className="border rounded-2xl p-5 bg-card">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{b.userName || "Hóspede"}</p>
                      <p className="text-muted-foreground text-sm">{b.accommodation.name}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {new Date(b.checkIn).toLocaleDateString("pt-BR")} → {new Date(b.checkOut).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {bookings.length === 0 && !error && (
          <div className="border-2 border-dashed border-border rounded-2xl py-12 px-6 text-center mb-10 hover:border-muted-foreground/30 transition">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-1">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Suas acomodações ainda não receberam reservas. Compartilhe seus anúncios para atrair hóspedes.
            </p>
          </div>
        )}

        {accommodations.length === 0 && !error && (
          <EmptyState
            icon="🏠"
            title="Nenhuma acomodação cadastrada."
            actionLabel="Cadastrar primeira acomodação"
            actionHref="/host/new"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accommodations.map((a) => (
            <div
              key={a.id}
              className="border rounded-2xl p-5 hover:border-muted-foreground/30 transition bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-lg">{a.name}</h2>
                <span className="text-blue-600 font-bold">{formatCurrency(a.pricePerNight)}/noite</span>
              </div>
              <p className="text-muted-foreground text-sm capitalize mb-2">
                {typeLabel(a.type)}
              </p>
              {a.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{a.description}</p>
              )}
              <div className="flex items-center gap-2 pt-3 border-t">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/host/${a.id}/edit`}>Editar</Link>
                </Button>
                <Button
                  onClick={() => setConfirmId(a.id)}
                  disabled={deleting === a.id}
                  variant="destructive"
                  className="flex-1"
                >
                  {deleting === a.id ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <ConfirmModal
          open={confirmId !== null}
          title="Excluir acomodação"
          message="Tem certeza que deseja excluir esta acomodação?"
          confirmLabel={deleting === confirmId ? "Excluindo..." : "Excluir"}
          cancelLabel="Cancelar"
          loading={deleting === confirmId}
          variant="danger"
          onConfirm={() => confirmId && handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      </main>
    </ProtectedRoute>
  );
}
