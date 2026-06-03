import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { PricingBreakdown, PricingService } from "../services/PricingService";
import { calcDays } from "../../domain/utils/date";

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
    const days = calcDays(input.checkIn, input.checkOut);
    const basePrice = accommodation.calculatePrice(days);
    return this.pricingService.calculate(basePrice, days);
  }
}