"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchPublicUser } from "@/lib/api";
import AvatarWithFallback from "@/components/AvatarWithFallback";
import { getErrorMessage } from "@/lib/errors";
import type { UserPublic } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPublicUser(id as string)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="max-w-lg mx-auto">
          <div className="border rounded-2xl p-8 space-y-6 bg-card">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-1/4 mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !user) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Usuário não encontrado</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-500 underline transition">
          Voltar ao início
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumbs segments={[{ label: user.name }]} />
      <FormCard title={user.name}>
      <div className="flex justify-center mb-4">
        <AvatarWithFallback
          src={user.avatarUrl}
          name={user.name}
          className="w-24 h-24"
          textClassName="text-3xl"
        />
      </div>

      <span className="inline-block text-xs uppercase tracking-wider bg-muted text-muted-foreground px-3 py-1 rounded-full">
        {user.role === "HOST" ? "Anfitrião" : "Hóspede"}
      </span>

      {user.bio && (
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{user.bio}</p>
      )}

      <p className="text-muted-foreground text-sm mt-4">
        {user.accommodationCount} {user.accommodationCount === 1 ? "acomodação anunciada" : "acomodações anunciadas"}
      </p>

      <p className="text-muted-foreground/50 text-xs mt-2">
        Membro desde {new Date(user.createdAt!).toLocaleDateString("pt-BR")}
      </p>

      <div className="mt-8">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </FormCard>
    </main>
  );
}
