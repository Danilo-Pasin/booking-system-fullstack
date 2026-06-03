"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      router.push("/login");
    }
  }, [user, token, isLoading, router]);

  if (isLoading) return null;
  if (!user || !token) return null;

  return <>{children}</>;
}
