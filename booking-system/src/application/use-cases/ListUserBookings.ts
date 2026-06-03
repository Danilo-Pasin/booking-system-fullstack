import { BookingRepository } from "../../domain/repositories/BookingRepository";

export interface ListUserBookingsInput {
  userId: string;
}

export class ListUserBookings {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: ListUserBookingsInput) {
    return this.bookingRepository.findByUserId(input.userId);
  }
}
