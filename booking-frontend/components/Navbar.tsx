"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X, ChevronDown, Building2, LogOut, User, Calendar, LayoutDashboard, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition"
        >
          <Building2 className="size-5 sm:size-6" />
          Booking System
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="size-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="cursor-pointer">
                    <User className="size-4" />
                    Editar Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <Calendar className="size-4" />
                    Minhas Reservas
                  </Link>
                </DropdownMenuItem>
                {user.role === "HOST" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/host" className="cursor-pointer">
                        <LayoutDashboard className="size-4" />
                        Painel Host
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/host/new" className="cursor-pointer">
                        <Plus className="size-4" />
                        Nova Acomodação
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </div>
          )}
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="size-4" />
                Booking System
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 p-6 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role === "HOST" ? "Anfitrião" : "Hóspede"}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/profile">
                      <User className="size-4" />
                      Meu Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/profile/edit">
                      <User className="size-4" />
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/bookings">
                      <Calendar className="size-4" />
                      Minhas Reservas
                    </Link>
                  </Button>
                  {user.role === "HOST" && (
                    <>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/host">
                          <LayoutDashboard className="size-4" />
                          Painel Host
                        </Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/host/new">
                          <Plus className="size-4" />
                          Nova Acomodação
                        </Link>
                      </Button>
                    </>
                  )}
                  <hr className="my-2" />
                  <Button variant="ghost" className="justify-start text-destructive" onClick={() => { logout(); setMobileOpen(false); }}>
                    <LogOut className="size-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button className="justify-center" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button variant="outline" className="justify-center" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/register">Cadastrar</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
