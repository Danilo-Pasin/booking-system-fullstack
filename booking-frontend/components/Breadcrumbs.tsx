"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getLabel(parts: string[], i: number): string {
  const s = parts[i];
  const prev = i > 0 ? parts[i - 1] : null;

  if (s === "profile") return "Perfil";
  if (s === "bookings") return "Minhas Reservas";
  if (s === "host") return "Painel do Host";
  if (s === "login") return "Entrar";
  if (s === "register") return "Cadastrar";
  if (s === "new") return "Nova Acomodação";
  if (s === "accommodations") return "Acomodações";
  if (s === "users") return "Usuários";

  if (s === "edit" && prev === "profile") return "Editar Perfil";
  if (s === "edit" && prev && UUID_REGEX.test(prev)) return "Editar Acomodação";
  if (s === "edit") return "Editar";

  if (UUID_REGEX.test(s)) {
    if (prev === "accommodations") return "Detalhes da Acomodação";
    if (prev === "users") return "Perfil Público";
    return s;
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Breadcrumbs({ segments: customSegments }: { segments?: { label: string; href?: string }[] }) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const parts = pathname.split("/").filter(Boolean);

  const items: { label: string; href?: string }[] = customSegments
    ? [{ label: "Início", href: "/" }, ...customSegments]
    : parts.reduce<{ label: string; href: string }[]>(
        (acc, _, i) => {
          const href = "/" + parts.slice(0, i + 1).join("/");
          acc.push({ label: getLabel(parts, i), href });
          return acc;
        },
        [{ label: "Início", href: "/" }]
      );

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
      {items.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/30 mx-1 select-none">›</span>}
          {i === items.length - 1 ? (
            <span className="text-foreground font-medium">{seg.label}</span>
          ) : (
            <Link
              href={seg.href || "/"}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {seg.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
