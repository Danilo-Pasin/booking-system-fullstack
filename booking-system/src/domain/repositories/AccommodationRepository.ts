import { Accommodation } from "../entities/Accommodation";

export interface AccommodationRepository {
  findById(id: string): Promise<Accommodation>;
  findAll(): Promise<Accommodation[]>;
  findByOwnerId(ownerId: string): Promise<Accommodation[]>;
  save(accommodation: Accommodation): Promise<void>;
  update(accommodation: Accommodation): Promise<void>;
  delete(id: string): Promise<void>;
}
