"use client";

export type Filters = {
  search: string;
  type: string;
  sort: string;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function AccommodationFilters({ filters, onChange }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Buscar por nome ou descrição..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 sm:w-64"
      />

      <select
        value={filters.type}
        onChange={(e) => set("type", e.target.value)}
        className="h-8 rounded-2xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <option value="all">Todos os tipos</option>
        <option value="house">Casa</option>
        <option value="apartment">Apartamento</option>
        <option value="shared_room">Quarto Compartilhado</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) => set("sort", e.target.value)}
        className="h-8 rounded-2xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <option value="none">Ordenar por</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="name_asc">Nome A-Z</option>
      </select>
    </div>
  );
}
