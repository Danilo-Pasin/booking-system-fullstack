import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";

export interface ListHostBookingsInput {
  ownerId: string;
}

export class ListHostBookings {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: ListHostBookingsInput): Promise<BookingSummary[]> {
    return this.bookingRepository.findByAccommodationOwnerId(input.ownerId);
  }
}
