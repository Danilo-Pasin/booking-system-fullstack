import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import type { BookingStatus } from "../../domain/entities/Booking";

export interface ListUserBookingsInput {
  userId: string;
  statuses?: BookingStatus[];
}

export class ListUserBookings {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: ListUserBookingsInput): Promise<BookingSummary[]> {
    return this.bookingRepository.findByUserId(input.userId, input.statuses);
  }
}
