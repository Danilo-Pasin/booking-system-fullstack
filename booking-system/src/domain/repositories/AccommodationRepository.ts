import { Accommodation } from "../entities/Accommodation";

export type AccommodationFilters = {
  search?: string;
  type?: "house" | "apartment" | "shared_room";
  sort?: "price_asc" | "price_desc" | "name_asc";
};

export interface AccommodationRepository {
  findById(id: string): Promise<Accommodation>;
  findAll(filters?: AccommodationFilters): Promise<Accommodation[]>;
  findByOwnerId(ownerId: string): Promise<Accommodation[]>;
  save(accommodation: Accommodation): Promise<void>;
  update(accommodation: Accommodation): Promise<void>;
  delete(id: string): Promise<void>;
}
