"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchMyAccommodations, deleteAccommodation, fetchHostDashboard, updateBookingStatus } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/MetricCard";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { typeLabel } from "@/lib/accommodation";
import { getErrorMessage } from "@/lib/errors";
import type { Accommodation, DashboardData } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

export default function HostPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "HOST") { router.push("/"); return; }
    load();
  }, [user, token, isLoading]);

  async function load() {
    if (!token) return;
    try {
      const [accData, dashData] = await Promise.all([
        fetchMyAccommodations(token),
        fetchHostDashboard(token),
      ]);
      setAccommodations(accData);
      setDashboard(dashData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

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

  if (isLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border rounded-2xl p-5 h-24 bg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="border rounded-2xl p-5 h-40 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
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

        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <MetricCard label="Acomodações" value={dashboard.accommodationsCount} />
            <MetricCard label="Reservas" value={dashboard.bookingsCount} />
            <MetricCard
              label="Receita Estimada"
              value={formatCurrency(dashboard.estimatedRevenue)}
              valueClassName="text-green-600"
            />
          </div>
        )}

        {dashboard && dashboard.pendingBookings && dashboard.pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Solicitações Pendentes
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {dashboard.pendingBookings.length}
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {dashboard.pendingBookings.map((pb) => (
                <div key={pb.id} className="border rounded-2xl p-5 bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{pb.accommodation.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {pb.userName || "Hóspede"} &middot; {new Date(pb.checkIn).toLocaleDateString("pt-BR")} → {new Date(pb.checkOut).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="text-blue-600 font-bold">{formatCurrency(pb.totalPrice)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        if (!token) return;
                        setProcessingStatus(pb.id);
                        try {
                          await updateBookingStatus(pb.id, "APPROVED", token);
                          toast.success("Reserva aprovada!");
                          await load();
                        } catch (err: unknown) {
                          toast.error(getErrorMessage(err));
                        } finally {
                          setProcessingStatus(null);
                        }
                      }}
                      disabled={processingStatus === pb.id}
                      className="flex-1"
                    >
                      {processingStatus === pb.id ? "Processando..." : "Aprovar"}
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!token) return;
                        setProcessingStatus(pb.id);
                        try {
                          await updateBookingStatus(pb.id, "REJECTED", token);
                          toast.success("Reserva recusada.");
                          await load();
                        } catch (err: unknown) {
                          toast.error(getErrorMessage(err));
                        } finally {
                          setProcessingStatus(null);
                        }
                      }}
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
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
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
