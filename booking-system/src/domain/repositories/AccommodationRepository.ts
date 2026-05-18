import { Accommodation } from "../entities/Accommodation";

export interface AccommodationRepository {
  findById(id: string): Promise<Accommodation>;
  findAll(): Promise<Accommodation[]>;
  save(accommodation: Accommodation): Promise<void>;
}