import { Booking } from "../../domain/entities/Booking";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { BookingRepository } from "../../domain/repositories/BookingRepository";
import { PricingService } from "../services/PricingService";

export interface CreateBookingInput {
  accommodationId: string;
  checkIn: Date;
  checkOut: Date;
}

export class CreateBooking {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly pricingService: PricingService,
    private readonly bookingRepository: BookingRepository
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    this.validateDates(input.checkIn, input.checkOut);

    const conflict = await this.bookingRepository.hasConflict(
    input.accommodationId,
    input.checkIn,
    input.checkOut
    );

    if (conflict) {
      throw new Error("Accommodation is not available for the selected dates.");
    }

    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId
    );

    const days = this.calcDays(input.checkIn, input.checkOut);
    const basePrice = accommodation.calculatePrice(days);
    const { total } = this.pricingService.calculate(basePrice);

    const booking = new Booking(accommodation, input.checkIn, input.checkOut, total);

    await this.bookingRepository.save(booking); // ← persiste no banco

    return booking;
  }

  private validateDates(checkIn: Date, checkOut: Date): void {
    if (checkOut <= checkIn) {
      throw new Error("Check-out must be after check-in.");
    }
    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error("Check-in cannot be in the past.");
    }
  }

  private calcDays(checkIn: Date, checkOut: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay);
  }
}