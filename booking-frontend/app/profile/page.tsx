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
  const { user, token, updateUser, login, isLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!token) return;
    fetchProfile(token)
      .then((data) => {
        setProfile(data);
        updateUser({ name: data.name, avatarUrl: data.avatarUrl, bio: data.bio });
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [user, token, isLoading]);

  async function handleUpgrade() {
    if (!token) return;
    setUpgrading(true);
    try {
      const result = await becomeHost(token);
      login(result.token, result.user);
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
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="border rounded-2xl p-8 space-y-6 bg-card">
          <Skeleton className="w-24 h-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <ProtectedRoute>
      <Breadcrumbs />
      <FormCard title={profile.name} subtitle={profile.email}>
        <div className="flex justify-center mb-4">
          <AvatarWithFallback
            src={profile.avatarUrl}
            name={profile.name}
            className="w-24 h-24"
            textClassName="text-3xl"
          />
        </div>

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
