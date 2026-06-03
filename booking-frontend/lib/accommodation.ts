export function typeLabel(t: string) {
  switch (t) {
    case "house": return "Casa";
    case "apartment": return "Apartamento";
    case "shared_room": return "Quarto Compartilhado";
    default: return t;
  }
}

export function typeIcon(t: string) {
  switch (t) {
    case "house": return "🏡";
    case "apartment": return "🏢";
    case "shared_room": return "🛏️";
    default: return "🏠";
  }
}
