"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setOnUnauthorized, fetchProfile, logout } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        setUser(profile);
        setToken("authenticated");
      })
      .catch(() => {
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
      toast.error("Sua sessão expirou. Faça login novamente.");
      router.push("/login");
    });
  }, []);

  function handleLogin(newToken: string, newUser: User) {
    setToken(newToken);
    setUser(newUser);
  }

  function handleUpdateUser(data: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // cookie might already be invalid
    }
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        updateUser: handleUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
