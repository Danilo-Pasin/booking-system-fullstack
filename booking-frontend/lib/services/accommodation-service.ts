import { fetchAccommodations } from "@/lib/api";
import type { Accommodation } from "@/lib/types";

export type AccommodationFilters = {
  search?: string;
  type?: "all" | "house" | "apartment" | "shared_room";
  sort?: "none" | "price_asc" | "price_desc" | "name_asc";
};

export type AccommodationFilterResult = {
  accommodations: Accommodation[];
  total: number;
  filtered: number;
};

const VALID_TYPES = ["all", "house", "apartment", "shared_room"] as const;
const VALID_SORTS = ["none", "price_asc", "price_desc", "name_asc"] as const;

export function validateFilters(raw: Partial<AccommodationFilters>): AccommodationFilters {
  const filters: AccommodationFilters = {};

  if (raw.search && typeof raw.search === "string") {
    filters.search = raw.search.trim().slice(0, 100);
  }

  if (raw.type && VALID_TYPES.includes(raw.type as typeof VALID_TYPES[number])) {
    filters.type = raw.type as AccommodationFilters["type"];
  }

  if (raw.sort && VALID_SORTS.includes(raw.sort as typeof VALID_SORTS[number])) {
    filters.sort = raw.sort as AccommodationFilters["sort"];
  }

  return filters;
}

export function buildQueryString(filters: AccommodationFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.sort && filters.sort !== "none") params.set("sort", filters.sort);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchFilteredAccommodations(
  filters: AccommodationFilters,
): Promise<AccommodationFilterResult> {
  const validated = validateFilters(filters);
  const qs = buildQueryString(validated);
  const all = await fetchAccommodations(qs);

  return {
    accommodations: all,
    total: all.length,
    filtered: all.length,
  };
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
