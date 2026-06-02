"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = await register(name, email, password);
    if (data.error) {
      toast.error(data.error);
      setLoading(false);
      return;
    }
    toast.success("Conta criada com sucesso!");
    router.push("/login");
  }

  return (
    <main className="max-w-md mx-auto p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Cadastro</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Já tem conta? <Link href="/login" className="text-blue-600">Entrar</Link>
      </p>
    </main>
  );
}