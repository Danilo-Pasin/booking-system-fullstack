"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-zinc-800 bg-black py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-blue-500 font-bold text-lg mb-2">Booking System</p>
            <p className="text-zinc-400 text-sm">
              Plataforma moderna de reservas de acomodações.
            </p>
          </div>

          <div>
            <p className="text-white font-semibold mb-3">Links Rápidos</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white transition">
                Início
              </Link>
              <Link href="/#accommodations" className="text-zinc-400 hover:text-white transition">
                Explorar
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-zinc-400 hover:text-white transition">
                    Perfil
                  </Link>
                  <Link href="/bookings" className="text-zinc-400 hover:text-white transition">
                    Reservas
                  </Link>
                  {user.role === "HOST" && (
                    <Link href="/host" className="text-zinc-400 hover:text-white transition">
                      Painel Host
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" className="text-zinc-400 hover:text-white transition">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-white font-semibold mb-3">Contato</p>
            <div className="flex flex-col gap-2 text-sm text-zinc-400">
              <span>contato@bookingsystem.com</span>
              <span>Suporte: suporte@bookingsystem.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 text-center text-sm text-zinc-500">
          &copy; 2026 Booking System. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
