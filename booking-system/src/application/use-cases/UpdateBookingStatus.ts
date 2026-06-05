import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { BookingNotFoundError, ValidationError, ForbiddenError, BookingNotPendingError, BookingAlreadyApprovedError } from "../../domain/errors/DomainError";
import type { BookingStatus } from "../../domain/entities/Booking";

export interface UpdateBookingStatusInput {
  bookingId: string;
  status: string;
  userId: string;
}

export class UpdateBookingStatus {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: UpdateBookingStatusInput): Promise<BookingSummary> {
    if (input.status !== "APPROVED" && input.status !== "REJECTED") {
      throw new ValidationError("Status must be APPROVED or REJECTED.");
    }

    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) throw new BookingNotFoundError();

    if (booking.accommodation.ownerId !== input.userId) {
      throw new ForbiddenError("You do not own this accommodation.");
    }

    if (booking.status !== "PENDING") {
      throw new BookingNotPendingError(booking.status);
    }

    if (input.status === "APPROVED") {
      const conflict = await this.bookingRepository.hasConflict(
        booking.accommodation.id,
        booking.checkIn,
        booking.checkOut,
        input.bookingId,
      );
      if (conflict) throw new BookingAlreadyApprovedError();
    }

    return this.bookingRepository.updateStatus(input.bookingId, input.status);
  }
}
