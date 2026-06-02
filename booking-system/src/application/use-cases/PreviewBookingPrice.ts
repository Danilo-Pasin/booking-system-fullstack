import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { PricingBreakdown, PricingService } from "../services/PricingService";

export interface PreviewPriceInput {
  accommodationId: string;
  checkIn: Date;
  checkOut: Date;
}

export class PreviewBookingPrice {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly pricingService: PricingService
  ) {}

  async execute(input: PreviewPriceInput): Promise<PricingBreakdown> {
    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId
    );
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil(
      (input.checkOut.getTime() - input.checkIn.getTime()) / msPerDay
    );
    const basePrice = accommodation.calculatePrice(days);
    return this.pricingService.calculate(basePrice, days);
  }
}