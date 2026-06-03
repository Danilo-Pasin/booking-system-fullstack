import { randomUUID } from "crypto";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { NotFoundError, NotOwnerError, ValidationError } from "../../domain/errors/DomainError";
import type { Accommodation } from "../../domain/entities/Accommodation";
import type { Image } from "../../domain/entities/Image";

export interface UpdateAccommodationInput {
  id: string;
  name?: string;
  pricePerNight?: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
  ownerId: string;
}

export class UpdateAccommodation {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
  ) {}

  async execute(input: UpdateAccommodationInput): Promise<Accommodation> {
    const existing = await this.accommodationRepository.findById(input.id);

    if (existing.ownerId !== input.ownerId) {
      throw new NotOwnerError();
    }

    const updatedPrice = input.pricePerNight ?? existing.pricePerNight;

    if (updatedPrice <= 0) {
      throw new ValidationError("pricePerNight must be a positive number");
    }

    const updatedName = input.name ?? existing.name;
    const existingAny = existing as any;

    let images = existing.images;
    if (input.images !== undefined) {
      if (input.images.length > 10) {
        throw new ValidationError("Maximum of 10 images allowed");
      }
      images = input.images.map((url, i) => ({
        id: randomUUID(),
        url,
        order: i,
      }));
    }

    const imageUrl = input.imageUrl !== undefined
      ? input.imageUrl
      : (images && images.length > 0 ? images[0].url : existingAny.imageUrl);

    const updated: Accommodation = Object.assign(Object.create(Object.getPrototypeOf(existing)), {
      ...existingAny,
      name: updatedName,
      pricePerNight: updatedPrice,
      description: input.description !== undefined ? input.description : existingAny.description,
      imageUrl,
      images,
    });

    await this.accommodationRepository.update(updated);

    return updated;
  }
}
