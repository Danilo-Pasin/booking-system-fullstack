import { randomUUID } from "crypto";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { AccommodationFactory } from "../../domain/factories/AccommodationFactory";
import { ValidationError } from "../../domain/errors/DomainError";
import type { Image } from "../../domain/entities/Image";

export interface CreateAccommodationInput {
  name: string;
  type: string;
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
  ownerId: string;
}

export class CreateAccommodation {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly factory: AccommodationFactory = new AccommodationFactory(),
  ) {}

  async execute(input: CreateAccommodationInput) {
    const validTypes = ["house", "apartment", "shared_room"];
    if (!validTypes.includes(input.type)) {
      throw new ValidationError(`Tipo de acomodação inválido '${input.type}'. Deve ser um de: ${validTypes.join(", ")}`);
    }

    if (input.pricePerNight <= 0) {
      throw new ValidationError("O preço por noite deve ser um número positivo");
    }

    if (input.images && input.images.length > 10) {
      throw new ValidationError("Máximo de 10 imagens permitidas");
    }

    const images: Image[] = (input.images ?? []).map((url, i) => ({
      id: randomUUID(),
      url,
      order: i,
      isPrimary: i === 0,
    }));

    const accommodation = this.factory.create({
      id: randomUUID(),
      name: input.name,
      type: input.type,
      pricePerNight: input.pricePerNight,
      description: input.description,
      imageUrl: input.imageUrl ?? images[0]?.url,
      images,
      ownerId: input.ownerId,
    });

    await this.accommodationRepository.save(accommodation);

    return accommodation;
  }
}
