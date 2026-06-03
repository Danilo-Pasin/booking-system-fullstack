import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";

export class ListMyAccommodations {
  constructor(private readonly accommodationRepository: AccommodationRepository) {}

  async execute({ ownerId }: { ownerId: string }) {
    return this.accommodationRepository.findByOwnerId(ownerId);
  }
}
