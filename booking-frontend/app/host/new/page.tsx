"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createAccommodation, uploadImage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FormCard } from "@/components/ui/FormCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function NewAccommodationPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("house");
  const [pricePerNight, setPricePerNight] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return null;
  if (!user || !token) { router.push("/login"); return null; }
  if (user.role !== "HOST") { router.push("/"); return null; }

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
      setImagePreview("");
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
      await createAccommodation(
        { name, type, pricePerNight: Number(pricePerNight), description: description || undefined, imageUrl: imageUrl || undefined },
        token
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
    <>
      <Breadcrumbs />
      <FormCard title="Nova acomodação" subtitle="Cadastre um novo imóvel para hospedagem">
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
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <Select
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="house">Casa</option>
          <option value="apartment">Apartamento</option>
          <option value="shared_room">Quarto Compartilhado</option>
        </Select>

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
          {errors.pricePerNight && <p className="text-red-400 text-sm mt-1">{errors.pricePerNight}</p>}
        </div>

        <div>
          <Textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={e => handleBlur("description", e.target.value)}
            rows={4}
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Imagem (opcional)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full text-zinc-400 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition file:cursor-pointer"
          />
          {uploading && <p className="text-blue-400 text-sm mt-2">Enviando imagem...</p>}
          {imagePreview && !uploading && (
            <div className="mt-3 rounded-lg overflow-hidden h-40 bg-zinc-800">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/host" className="text-blue-400 hover:text-blue-300 transition">
          Voltar ao painel
        </Link>
      </p>
    </FormCard>
    </>
  );
}
