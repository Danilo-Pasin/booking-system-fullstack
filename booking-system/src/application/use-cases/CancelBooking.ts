import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { BookingNotFoundError, ForbiddenError, ValidationError } from "../../domain/errors/DomainError";

export interface CancelBookingInput {
  id: string;
  userId: string;
}

export class CancelBooking {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: CancelBookingInput): Promise<BookingSummary> {
    const booking = await this.bookingRepository.findById(input.id);

    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.userId !== input.userId) {
      throw new ForbiddenError("This booking does not belong to you.");
    }

    if (booking.status === "REJECTED" || booking.status === "CANCELED") {
      throw new ValidationError("This booking cannot be cancelled because it is already " + booking.status.toLowerCase() + ".");
    }

    return this.bookingRepository.updateStatus(input.id, "CANCELED");
  }
}
