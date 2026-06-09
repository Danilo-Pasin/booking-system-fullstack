"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchProfile, becomeHost } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AvatarWithFallback from "@/components/AvatarWithFallback";
import ConfirmModal from "@/components/ConfirmModal";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, login, isLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    fetchProfile()
      .then((data) => {
        setProfile(data);
        updateUser({ name: data.name, avatarUrl: data.avatarUrl, bio: data.bio });
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [user, isLoading, router, updateUser]);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const result = await becomeHost();
      login(result.user);
      setProfile(result.user);
      toast.success("Agora você é um anfitrião!");
      setShowConfirm(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpgrading(false);
    }
  }

  if (isLoading || loading) {
    return (
      <ProtectedRoute>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-5 w-32 mb-8" />
          <div className="max-w-lg mx-auto">
            <div className="border rounded-2xl p-8 space-y-6 bg-card">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-1/3 mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!profile) return null;

  const allImages = (profile.images ?? []).filter(i => i.url).map(i => i.url);
  const mainImage = allImages[selectedImage] ?? profile.avatarUrl;

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs />
        <FormCard title={profile.name} subtitle={profile.email}>
        {allImages.length > 0 ? (
          <div className="mb-4">
            <div
              className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-muted cursor-pointer border-4 border-blue-100"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={mainImage}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-3 overflow-x-auto">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition ${i === selectedImage ? "border-blue-500" : "border-transparent hover:border-muted-foreground/30"}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <AvatarWithFallback
              src={profile.avatarUrl}
              name={profile.name}
              className="w-24 h-24"
              textClassName="text-3xl"
            />
          </div>
        )}

        <span className="inline-block text-xs uppercase tracking-wider bg-muted text-muted-foreground px-3 py-1 rounded-full">
          {profile.role === "HOST" ? "Anfitrião" : "Hóspede"}
        </span>

        {profile.bio && (
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{profile.bio}</p>
        )}

        {profile.createdAt && (
          <p className="text-muted-foreground/50 text-xs mt-4">
            Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link href="/profile/edit">Editar perfil</Link>
          </Button>
          {profile.role !== "HOST" && (
            <Button
              onClick={() => setShowConfirm(true)}
              variant="outline"
            >
              Tornar-me anfitrião
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </FormCard>
      </main>

      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {selectedImage > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage - 1); }}
              className="absolute left-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img
            src={mainImage}
            alt=""
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage + 1); }}
              className="absolute right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <span className="absolute bottom-4 left-4 text-white/70 text-sm">
            {selectedImage + 1} / {allImages.length}
          </span>
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        title="Tornar-se anfitrião"
        message="Você poderá cadastrar e gerenciar suas próprias acomodações. Deseja continuar?"
        confirmLabel={upgrading ? "Atualizando..." : "Confirmar"}
        cancelLabel="Cancelar"
        loading={upgrading}
        variant="primary"
        onConfirm={handleUpgrade}
        onCancel={() => setShowConfirm(false)}
      />
    </ProtectedRoute>
  );
}
