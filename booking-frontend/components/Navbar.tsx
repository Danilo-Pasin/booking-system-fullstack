"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AvatarWithFallback from "./AvatarWithFallback";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function isActive(href: string) {
    return pathname === href;
  }

  function navLinkClasses(href: string) {
    return `transition ${
      isActive(href)
        ? "text-blue-400 border-b-2 border-blue-500"
        : "text-zinc-400 hover:text-white"
    }`;
  }

  return (
    <header className="border-b border-zinc-800 bg-black text-white sticky top-0 z-50 backdrop-blur-sm bg-black/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold text-blue-500 tracking-tight"
        >
          Booking System
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 text-sm">
          <Link
            href="/"
            className={`${navLinkClasses("/")} hidden sm:inline`}
          >
            Home
          </Link>

          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-zinc-300 hover:text-white transition"
              >
                <AvatarWithFallback
                  src={user.avatarUrl}
                  name={user.name}
                  className="w-7 h-7"
                  textClassName="text-xs"
                />
                <span className="hidden sm:inline">{user.name}</span>
                <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-sm"
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-sm"
                  >
                    Editar Perfil
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-sm"
                  >
                    Minhas Reservas
                  </Link>
                  {user.role === "HOST" && (
                    <Link
                      href="/host"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-sm"
                    >
                      Painel Host
                    </Link>
                  )}
                  <hr className="border-zinc-800" />
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-zinc-800 transition text-sm"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`${navLinkClasses("/login")} hidden sm:inline`}
              >
                Entrar
              </Link>

              <Link
                href="/register"
                className={`hidden sm:inline ${
                  isActive("/register")
                    ? "bg-blue-700 text-white border-b-2 border-blue-300"
                    : "bg-blue-600 text-white"
                } px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm`}
              >
                Cadastrar
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 text-zinc-400 hover:text-white transition"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </nav>
      </div>

      {!user && mobileOpen && (
        <div className="sm:hidden transition-all duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-b-2xl shadow-xl p-4 mx-4 mb-2 flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium ${
                isActive("/") ? "text-blue-400" : "text-zinc-300"
              } hover:text-white transition`}
            >
              Home
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium ${
                isActive("/login") ? "text-blue-400" : "text-zinc-300"
              } hover:text-white transition`}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
