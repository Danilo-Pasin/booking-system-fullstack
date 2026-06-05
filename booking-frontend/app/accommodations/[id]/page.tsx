"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { previewPrice, createBooking, fetchAccommodation, fetchPublicUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AvatarWithFallback from "@/components/AvatarWithFallback";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageLightbox } from "@/components/ImageLightbox";
import { formatCurrency } from "@/lib/currency";
import { typeLabel, typeIcon } from "@/lib/accommodation";
import { getErrorMessage } from "@/lib/errors";
import type { Accommodation, UserPublic, PricePreview, FeeItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";

export default function AccommodationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [host, setHost] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAccommodation(id as string)
      .then((data) => {
        setAccommodation(data);
        setLoading(false);
        if (data.ownerId) {
          fetchPublicUser(data.ownerId).then(setHost).catch(() => {});
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  async function handlePreview() {
    if (!checkIn || !checkOut) return;
    setLoadingPreview(true);
    setError("");
    try {
      const data = await previewPrice(id as string, checkIn, checkOut);
      setPreview(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleBook() {
    if (!token) { router.push("/login"); return; }
    setLoadingBook(true);
    try {
      await createBooking(id as string, checkIn, checkOut, token);
      setSuccess(true);
      toast.success("Solicitação enviada ao anfitrião.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingBook(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <Skeleton className="h-6 w-16 mb-6" />
        <div className="border rounded-2xl overflow-hidden bg-card">
          <Skeleton className="h-56 sm:h-64" />
          <div className="p-6 sm:p-8 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Acomodação não encontrada</h1>
        <p className="text-muted-foreground mb-6">Esta acomodação pode ter sido removida.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-500 underline transition">
          Voltar ao início
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <button
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-flex items-center gap-1 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <Breadcrumbs segments={[{ label: accommodation.name }]} />

      <div className="border rounded-2xl overflow-hidden bg-card">
        {(() => {
          const allImages = (accommodation.images ?? []).filter(i => i.url).map(i => i.url);
          const mainImage = allImages[selectedImage] ?? accommodation.imageUrl;
          return (
            <>
              <div
                className="h-56 sm:h-64 overflow-hidden bg-muted cursor-pointer"
                onClick={() => setLightboxIndex(selectedImage)}
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-muted to-muted/80">
                    {typeIcon(accommodation.type)}
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 px-6 pb-4 -mt-2 overflow-x-auto">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedImage(i); setLightboxIndex(i); }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? "border-blue-500" : "border-transparent hover:border-muted-foreground/30"}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{accommodation.name}</h1>
              <span className="text-muted-foreground text-sm">{typeLabel(accommodation.type)}</span>
            </div>
            <p className="text-blue-600 font-bold text-2xl">
              {formatCurrency(accommodation.pricePerNight)}
              <span className="text-muted-foreground font-normal text-sm ml-1">/ noite</span>
            </p>
          </div>

          {accommodation.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed">{accommodation.description}</p>
          )}

          {host && (
            <div className="mb-6 bg-muted/30 border rounded-xl p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Anfitrião</p>
              <Link href={`/users/${host.id}`} className="flex items-center gap-3 group">
                <AvatarWithFallback
                  src={host.avatarUrl}
                  name={host.name}
                  className="w-10 h-10"
                  textClassName="text-sm"
                />
                <div>
                  <p className="font-medium group-hover:text-blue-600 transition text-sm">{host.name}</p>
                  <p className="text-muted-foreground text-xs">{host.accommodationCount} {host.accommodationCount === 1 ? "acomodação" : "acomodações"}</p>
                </div>
              </Link>
            </div>
          )}

          {success ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-800 font-semibold text-lg">⏳ Solicitação enviada com sucesso!</p>
              <p className="text-yellow-700 text-sm mt-2">
                O anfitrião analisará sua solicitação. Você será notificado quando ela for aprovada ou recusada.
              </p>
              <button onClick={() => router.push("/bookings")} className="mt-4 text-blue-600 underline hover:text-blue-500 transition">
                Ver minhas reservas
              </button>
            </div>
          ) : (
            <div className="bg-muted/30 border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Fazer reserva</h2>
              {error && <p className="text-destructive text-sm mb-3">{error}</p>}
              <div className="flex gap-4 flex-col sm:flex-row mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                  />
                </div>
              </div>
              <Button
                onClick={handlePreview}
                disabled={loadingPreview}
                variant="outline"
                className="w-full"
              >
                {loadingPreview ? "Calculando..." : "Ver preço"}
              </Button>

              {preview && (
                <div className="mt-6 bg-card border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Resumo de preços</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base ({preview.base > 0 ? `${(preview.base / accommodation.pricePerNight).toFixed(0)} diárias` : ""})</span>
                    <span className="font-medium">{formatCurrency(preview.base)}</span>
                  </div>
                  <div className="border-t" />
                  {preview.fees?.map((f: FeeItem) => {
                    const isDiscount = f.amount < 0;
                    const isLongStay = f.name.includes("Long Stay");
                    return (
                      <div key={f.name} className="flex justify-between text-sm">
                        <span className={isLongStay ? "text-green-600" : "text-muted-foreground"}>{f.name}</span>
                        <span className={`font-medium ${isDiscount ? "text-green-600" : ""}`}>
                          {isDiscount ? `−${formatCurrency(Math.abs(f.amount))}` : `+${formatCurrency(f.amount)}`}
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600 text-xl">{formatCurrency(preview.total)}</span>
                  </div>
                </div>
              )}

              {preview && (
                <Button
                  onClick={handleBook}
                  disabled={loadingBook}
                  className="w-full mt-4"
                >
                  {loadingBook ? "Enviando..." : "Solicitar reserva"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && accommodation.images && (
        <ImageLightbox
          images={accommodation.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </main>
  );
}
