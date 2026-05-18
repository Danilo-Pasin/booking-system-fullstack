"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login: signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = await login(email, password);
    if (data.error) {
      setError(data.error);
      return;
    }
    signIn(data.token, data.user);

    router.push("/");
  }

  return (
    <main className="max-w-md mx-auto p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Entrar
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Não tem conta? <Link href="/register" className="text-blue-600">Cadastre-se</Link>
      </p>
    </main>
  );
}