"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createAccommodation, uploadImage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import type { ImageItem } from "@/lib/types";

export default function NewAccommodationPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("house");
  const [pricePerNight, setPricePerNight] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return null;
  if (!user) { router.push("/login"); return null; }
  if (user.role !== "HOST") { router.push("/"); return null; }

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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "O nome é obrigatório.";
    if (!pricePerNight || Number(pricePerNight) <= 0) errs.pricePerNight = "O preço por noite deve ser maior que zero.";
    if (description.length > 1000) errs.description = "A descrição deve ter no máximo 1000 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setSaving(true);
    try {
      await createAccommodation(
        { name, type, pricePerNight: Number(pricePerNight), description: description || undefined, images: images.map(i => i.url) },
      );
      toast.success("Acomodação criada com sucesso!");
      router.push("/host");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumbs />
      <FormCard title="Nova acomodação" subtitle="Cadastre um novo imóvel para hospedagem">
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

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm"
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
            rows={4}
          />
          {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Fotos (opcional)</label>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, i) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt=""
                    className={`w-24 h-20 rounded-lg object-cover border-2 ${img.isPrimary ? "border-blue-500" : "border-transparent"}`}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 rounded-lg">
                    {!img.isPrimary && (
                      <button type="button" onClick={() => handleSetPrimary(i)} className="text-white text-xs bg-blue-600 px-1 py-0.5 rounded" title="Principal">★</button>
                    )}
                    <button type="button" onClick={() => handleRemove(i)} className="text-white text-xs bg-red-600 px-1 py-0.5 rounded" title="Remover">✕</button>
                  </div>
                  {img.isPrimary && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1 rounded">principal</span>}
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload}
            className="w-full text-muted-foreground text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 transition file:cursor-pointer"
          />
          {uploading && <p className="text-blue-600 text-sm mt-2">Enviando imagem...</p>}
        </div>

        <Button type="submit" disabled={saving || uploading} className="w-full">
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/host" className="text-blue-600 hover:text-blue-500 transition">
          Voltar ao painel
        </Link>
      </p>
    </FormCard>
    </main>
  );
}
