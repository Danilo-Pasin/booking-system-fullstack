import { AccommodationRepository, AccommodationFilters } from "../../domain/repositories/AccommodationRepository";

export type ListAccommodationsInput = {
  search?: string;
  type?: string;
  sort?: string;
};

const VALID_TYPES = ["house", "apartment", "shared_room"] as const;
const VALID_SORTS = ["price_asc", "price_desc", "name_asc"] as const;

export class ListAccommodations {
  constructor(private readonly accommodationRepository: AccommodationRepository) {}

  async execute(input?: ListAccommodationsInput) {
    const filters: AccommodationFilters = {};

    if (input?.search) {
      filters.search = input.search.trim().slice(0, 100);
    }

    if (input?.type && VALID_TYPES.includes(input.type as typeof VALID_TYPES[number])) {
      filters.type = input.type as AccommodationFilters["type"];
    }

    if (input?.sort && VALID_SORTS.includes(input.sort as typeof VALID_SORTS[number])) {
      filters.sort = input.sort as AccommodationFilters["sort"];
    }

    return this.accommodationRepository.findAll(filters);
  }
}
