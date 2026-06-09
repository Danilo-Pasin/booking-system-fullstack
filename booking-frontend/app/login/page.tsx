"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { login } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login: signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "O email é obrigatório.";
    if (!password) errs.password = "A senha é obrigatória.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBlur(field: string, value: string) {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [field]: field === "email" ? "O email é obrigatório." : "A senha é obrigatória." }));
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
      const data = await login(email, password);
      signIn(data.user);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormCard title="Entrar" subtitle="Acesse sua conta para reservar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-500 transition">
          Cadastre-se
        </Link>
      </p>
    </FormCard>
  );
}
