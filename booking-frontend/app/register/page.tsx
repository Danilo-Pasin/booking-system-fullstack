"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { register } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "O nome deve ter pelo menos 2 caracteres.";
    if (!email.trim()) errs.email = "O email é obrigatório.";
    if (!password || password.length < 8) errs.password = "A senha deve ter pelo menos 8 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBlur(field: string, value: string) {
    const msg: Record<string, string> = {
      name: "O nome deve ter pelo menos 2 caracteres.",
      email: "O email é obrigatório.",
      password: "A senha deve ter pelo menos 8 caracteres.",
    };
    if (!value.trim() || (field === "name" && value.trim().length < 2) || (field === "password" && value.length < 8)) {
      setErrors(prev => ({ ...prev, [field]: msg[field] }));
    } else {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormCard title="Criar conta" subtitle="Preencha os dados para se cadastrar">
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
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={e => handleBlur("email", e.target.value)}
            required
          />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={e => handleBlur("password", e.target.value)}
            required
          />
          {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-500 transition">
          Entrar
        </Link>
      </p>
    </FormCard>
  );
}
