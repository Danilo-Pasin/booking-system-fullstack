"use client";
import { useEffect, useState } from "react";
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

export default function EditProfilePage() {
  const router = useRouter();
  const { user, token, updateUser, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading) return;
    if (!token) return;
    fetchProfile(token)
      .then((data) => {
        setName(data.name);
        setAvatarUrl(data.avatarUrl ?? "");
        setBio(data.bio ?? "");
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [user, token, isLoading, router]);

  function validateField(field: string, value: string): string | null {
    switch (field) {
      case "name":
        if (!value.trim() || value.trim().length < 2) return "O nome deve ter pelo menos 2 caracteres.";
        return null;
      case "avatarUrl":
        if (value.trim() && !/^https?:\/\//.test(value.trim())) return "A URL deve começar com http:// ou https://.";
        return null;
      case "bio":
        if (value.length > 500) return "A biografia deve ter no máximo 500 caracteres.";
        return null;
      default:
        return null;
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const fields = [
      ["name", name],
      ["avatarUrl", avatarUrl],
      ["bio", bio],
    ] as const;
    for (const [f, v] of fields) {
      const err = validateField(f, v);
      if (err) errs[f] = err;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBlur(field: string, value: string) {
    const err = validateField(field, value);
    if (err) {
      setErrors(prev => ({ ...prev, [field]: err }));
    } else {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErrors({});
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await updateProfile(
        { name, avatarUrl: avatarUrl || undefined, bio: bio || undefined },
        token
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
              <Skeleton className="h-12 rounded-lg" />
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
              onBlur={e => handleBlur("name", e.target.value)}
              required
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Foto do perfil</label>
            <div className="flex items-center gap-3 mb-2">
              {avatarUrl && (
                <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border" />
              )}
              <label className="cursor-pointer bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition">
                {uploadingAvatar ? "Enviando..." : "Enviar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !token) return;
                    setUploadingAvatar(true);
                    try {
                      const { url } = await uploadImage(file, token);
                      setAvatarUrl(url);
                    } catch (err: unknown) {
                      toast.error(getErrorMessage(err));
                    } finally {
                      setUploadingAvatar(false);
                    }
                  }}
                />
              </label>
            </div>
            <Input
              type="url"
              placeholder="Ou cole uma URL (opcional)"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              onBlur={e => handleBlur("avatarUrl", e.target.value)}
            />
            {errors.avatarUrl && <p className="text-destructive text-sm mt-1">{errors.avatarUrl}</p>}
          </div>

          <div>
            <Textarea
              placeholder="Biografia (opcional, max 500 caracteres)"
              value={bio}
              onChange={e => setBio(e.target.value)}
              onBlur={e => handleBlur("bio", e.target.value)}
              rows={4}
              maxLength={500}
            />
            {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio}</p>}
          </div>

          <Button type="submit" disabled={saving} className="w-full">
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
