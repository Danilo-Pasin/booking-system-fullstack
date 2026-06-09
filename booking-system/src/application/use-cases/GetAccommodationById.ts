import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { AccommodationNotFoundError } from "../../domain/errors/DomainError";

export interface GetAccommodationByIdInput {
  id: string;
}

export class GetAccommodationById {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
  ) {}

  async execute(input: GetAccommodationByIdInput) {
    const accommodation = await this.accommodationRepository.findById(input.id);
    return {
      id: accommodation.id,
      name: accommodation.name,
      pricePerNight: accommodation.pricePerNight,
      type: accommodation.type,
      imageUrl: accommodation.imageUrl,
      images: accommodation.images,
      description: accommodation.description,
      ownerId: accommodation.ownerId,
    };
  }
}
