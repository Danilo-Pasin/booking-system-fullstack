"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchProfile, updateProfile, uploadImage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import type { ImageItem } from "@/lib/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading) return;
    fetchProfile()
      .then((data) => {
        setName(data.name);
        setImages(data.images ?? []);
        setBio(data.bio ?? "");
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [user, isLoading, router]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "O nome deve ter pelo menos 2 caracteres.";
    if (bio.length > 500) errs.bio = "A biografia deve ter no máximo 500 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImages(prev => [...prev, { id: crypto.randomUUID(), url, order: prev.length, isPrimary: prev.length === 0 }]);
      toast.success("Imagem adicionada!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((img, i) => ({ ...img, order: i, isPrimary: i === 0 }));
    });
  }

  function handleSetPrimary(index: number) {
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function handleReorder(from: number, to: number) {
    setImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((img, i) => ({ ...img, order: i, isPrimary: i === 0 }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await updateProfile(
        { name, images: images.map(i => i.url), bio: bio || undefined },
      );
      updateUser({ name: result.name, avatarUrl: result.avatarUrl, bio: result.bio });
      toast.success("Perfil atualizado!");
      router.push("/profile");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || loading) {
    return (
      <ProtectedRoute>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-5 w-32 mb-8" />
          <div className="max-w-lg mx-auto">
            <div className="border rounded-2xl p-8 space-y-6 bg-card">
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-1/3 mx-auto" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs />
        <FormCard title="Editar perfil" subtitle="Atualize suas informações">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Fotos do perfil</label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt=""
                      className={`w-20 h-20 rounded-lg object-cover border-2 ${img.isPrimary ? "border-blue-500" : "border-transparent"}`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 rounded-lg">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(i)}
                          className="text-white text-xs bg-blue-600 px-1 py-0.5 rounded"
                          title="Definir como principal"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        className="text-white text-xs bg-red-600 px-1 py-0.5 rounded"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReorder(i, i - 1)}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 bg-muted rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Mover para esquerda"
                      >
                        ‹
                      </button>
                    )}
                    {i < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleReorder(i, i + 1)}
                        className="absolute -right-2 top-1/2 -translate-y-1/2 bg-muted rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Mover para direita"
                      >
                        ›
                      </button>
                    )}
                    {img.isPrimary && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1 rounded"> principal</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition inline-block">
              {uploading ? "Enviando..." : "Adicionar foto"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </div>

          <div>
            <Textarea
              placeholder="Biografia (opcional, max 500 caracteres)"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              maxLength={500}
            />
            {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio}</p>}
          </div>

          <Button type="submit" disabled={saving || uploading} className="w-full">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/profile" className="text-blue-600 hover:text-blue-500 transition">
            Cancelar
          </Link>
        </p>
      </FormCard>
      </main>
    </ProtectedRoute>
  );
}
