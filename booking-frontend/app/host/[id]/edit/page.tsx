"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchAccommodation, updateAccommodation, uploadImage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

export default function EditAccommodationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token, isLoading } = useAuth();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [type, setType] = useState("house");
  const [pricePerNight, setPricePerNight] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "HOST") { router.push("/"); return; }
    if (!id) return;
    load(id);
  }, [user, token, id, isLoading]);

  async function load(accommodationId: string) {
    try {
      const data = await fetchAccommodation(accommodationId);
      setName(data.name);
      setType(data.type);
      setPricePerNight(String(data.pricePerNight));
      setDescription(data.description ?? "");
      setImageUrl(data.imageUrl ?? "");
      setImagePreview(data.imageUrl ?? "");
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploading(true);

    try {
      const result = await uploadImage(file, token);
      setImageUrl(result.url);
      toast.success("Imagem enviada!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      setImagePreview(imageUrl);
    } finally {
      setUploading(false);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "O nome é obrigatório.";
    if (!pricePerNight || Number(pricePerNight) <= 0) errs.pricePerNight = "O preço por noite deve ser maior que zero.";
    if (description.length > 1000) errs.description = "A descrição deve ter no máximo 1000 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBlur(field: string, value: string) {
    if (field === "name" && !value.trim()) {
      setErrors(prev => ({ ...prev, name: "O nome é obrigatório." }));
    } else if (field === "pricePerNight" && (!value || Number(value) <= 0)) {
      setErrors(prev => ({ ...prev, pricePerNight: "O preço por noite deve ser maior que zero." }));
    } else if (field === "description" && value.length > 1000) {
      setErrors(prev => ({ ...prev, description: "A descrição deve ter no máximo 1000 caracteres." }));
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
      await updateAccommodation(
        id,
        { name, pricePerNight: Number(pricePerNight), description: description || undefined, imageUrl: imageUrl || undefined },
        token
      );
      toast.success("Acomodação atualizada!");
      router.push("/host");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="border rounded-2xl p-8 space-y-6 bg-card">
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Acomodação não encontrada</h1>
        <p className="text-muted-foreground mb-6">O ID informado não corresponde a nenhuma acomodação.</p>
        <Link
          href="/host"
          className="text-blue-600 hover:text-blue-500 underline transition"
        >
          Voltar ao painel
        </Link>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumbs segments={[{ label: name }]} />
      <FormCard title="Editar acomodação" subtitle="Atualize os dados do imóvel">
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

          <select
            value={type}
            onChange={e => setType(e.target.value)}
            disabled
            className="h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm disabled:opacity-50"
          >
            <option value="house">Casa</option>
            <option value="apartment">Apartamento</option>
            <option value="shared_room">Quarto Compartilhado</option>
          </select>

          <div>
            <Input
              type="number"
              placeholder="Preço por noite"
              value={pricePerNight}
              onChange={e => setPricePerNight(e.target.value)}
              onBlur={e => handleBlur("pricePerNight", e.target.value)}
              min={1}
              required
            />
            {errors.pricePerNight && <p className="text-destructive text-sm mt-1">{errors.pricePerNight}</p>}
          </div>

          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={e => handleBlur("description", e.target.value)}
              rows={4}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Imagem (opcional)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full text-muted-foreground text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 transition file:cursor-pointer"
            />
            {uploading && <p className="text-blue-600 text-sm mt-2">Enviando imagem...</p>}
            {imagePreview && !uploading && (
              <div className="mt-3 rounded-lg overflow-hidden h-40 bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <Button type="submit" disabled={saving || uploading} className="w-full">
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/host" className="text-blue-600 hover:text-blue-500 transition">
            Cancelar
          </Link>
        </p>
      </FormCard>
      </main>
    </ProtectedRoute>
  );
}
