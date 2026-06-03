import { Accommodation } from "../../domain/entities/Accommodation";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
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

  async findAll(): Promise<Accommodation[]> {
    return Array.from(this.store.values());
  }

  async findByOwnerId(ownerId: string): Promise<Accommodation[]> {
    return Array.from(this.store.values()).filter((a) => a.ownerId === ownerId);
  }
}
