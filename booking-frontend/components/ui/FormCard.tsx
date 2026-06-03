export function FormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 sm:py-20">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </main>
  );
}
