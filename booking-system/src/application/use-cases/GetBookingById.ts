import { BookingRepository } from "../../domain/repositories/BookingRepository";
import { NotFoundError, ForbiddenError } from "../../domain/errors/DomainError";

export interface GetBookingByIdInput {
  bookingId: string;
  userId: string;
}

export class GetBookingById {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(input: GetBookingByIdInput) {
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.userId !== input.userId) {
      throw new ForbiddenError("This booking does not belong to you");
    }
    return booking;
  }
}
