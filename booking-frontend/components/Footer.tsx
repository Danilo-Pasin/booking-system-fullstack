export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Sistema de Reservas. Todos os direitos reservados.
      </div>
    </footer>
  );
}
