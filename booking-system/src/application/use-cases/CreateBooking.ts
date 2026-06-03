import { Booking } from "../../domain/entities/Booking";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { BookingRepository } from "../../domain/repositories/BookingRepository";
import { PricingService } from "../services/PricingService";
import {
  InvalidDateRangeError,
  PastCheckInError,
} from "../../domain/errors/DomainError";
import { calcDays } from "../../domain/utils/date";
import { BookingCreatedEvent } from "../../domain/events/BookingCreatedEvent";
import { EventDispatcher } from "../events/EventDispatcher";

export interface CreateBookingInput {
  accommodationId: string;
  checkIn: Date;
  checkOut: Date;
  userId: string;
}

export class CreateBooking {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly pricingService: PricingService,
    private readonly bookingRepository: BookingRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    this.validateDates(input.checkIn, input.checkOut);

    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId
    );

    const days = calcDays(input.checkIn, input.checkOut);
    const basePrice = accommodation.calculatePrice(days);
    const { total } = this.pricingService.calculate(basePrice, days);

    const booking = new Booking(accommodation, input.checkIn, input.checkOut, total, input.userId);

    await this.bookingRepository.tryCreate(booking);

    this.eventDispatcher.dispatch(new BookingCreatedEvent(booking));

    return booking;
  }

  private validateDates(checkIn: Date, checkOut: Date): void {
    if (checkOut <= checkIn) {
      throw new InvalidDateRangeError();
    }
    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new PastCheckInError();
    }
  }

}
