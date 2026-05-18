import { Accommodation } from "../../domain/entities/Accommodation";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";

export class InMemoryAccommodationRepository implements AccommodationRepository {
  private readonly store = new Map<string, Accommodation>();

  async save(accommodation: Accommodation): Promise<void> {
    this.store.set(accommodation.id, accommodation);
  }

  async findById(id: string): Promise<Accommodation> {
    const found = this.store.get(id);
    if (!found) throw new Error(`Accommodation not found: ${id}`);
    return found;
  }

  async findAll(): Promise<Accommodation[]> {
    return Array.from(this.store.values());
  }
}