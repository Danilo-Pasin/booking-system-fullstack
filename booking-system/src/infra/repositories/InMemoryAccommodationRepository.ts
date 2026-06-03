import { Accommodation } from "../../domain/entities/Accommodation";
import { AccommodationRepository, AccommodationFilters } from "../../domain/repositories/AccommodationRepository";
import { AccommodationNotFoundError } from "../../domain/errors/DomainError";

export class InMemoryAccommodationRepository implements AccommodationRepository {
  private readonly store = new Map<string, Accommodation>();

  async save(accommodation: Accommodation): Promise<void> {
    this.store.set(accommodation.id, accommodation);
  }

  async update(accommodation: Accommodation): Promise<void> {
    this.store.set(accommodation.id, accommodation);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findById(id: string): Promise<Accommodation> {
    const found = this.store.get(id);
    if (!found) throw new AccommodationNotFoundError();
    return found;
  }

  async findAll(filters?: AccommodationFilters): Promise<Accommodation[]> {
    let result = Array.from(this.store.values());

    if (filters?.type) {
      result = result.filter((a) => a.type === filters.type);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          ((a as any).description && (a as any).description.toLowerCase().includes(q))
      );
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case "price_asc":
          result.sort((a, b) => a.pricePerNight - b.pricePerNight);
          break;
        case "price_desc":
          result.sort((a, b) => b.pricePerNight - a.pricePerNight);
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }

  async findByOwnerId(ownerId: string): Promise<Accommodation[]> {
    return Array.from(this.store.values()).filter((a) => a.ownerId === ownerId);
  }
}
