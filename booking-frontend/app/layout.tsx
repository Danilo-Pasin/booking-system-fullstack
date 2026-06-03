import type { Metadata } from "next";

import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booking System",
  description: "Modern booking platform",
};

import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", "scroll-smooth", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />

          <div className="flex-1 animate-fadeIn">
            {children}
          </div>
          <Footer />
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" },
          }}
        />
      </body>
    </html>
  );
}
