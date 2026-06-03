import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { NotOwnerError } from "../../domain/errors/DomainError";

export interface DeleteAccommodationInput {
  id: string;
  ownerId: string;
}

export class DeleteAccommodation {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
  ) {}

  async execute(input: DeleteAccommodationInput): Promise<void> {
    const existing = await this.accommodationRepository.findById(input.id);

    if (existing.ownerId !== input.ownerId) {
      throw new NotOwnerError();
    }

    await this.accommodationRepository.delete(input.id);
  }
}
