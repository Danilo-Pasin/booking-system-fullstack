import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";

export class ListAccommodations {
  constructor(private readonly accommodationRepository: AccommodationRepository) {}

  async execute() {
    return this.accommodationRepository.findAll();
  }
}
