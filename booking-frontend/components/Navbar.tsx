"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-800 bg-black text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        <Link
          href="/"
          className="text-2xl font-bold text-blue-500"
        >
          Booking System
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/">
            Home
          </Link>

          {user ? (
            <>
              <Link href="/bookings">
                My Bookings
              </Link>

              <span className="text-zinc-400">
                {user.name}
              </span>

              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                Login
              </Link>

              <Link
                href="/register"
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}