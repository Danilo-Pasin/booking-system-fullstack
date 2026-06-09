import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { BookingNotFoundError, ValidationError, ForbiddenError, BookingNotPendingError, BookingAlreadyApprovedError } from "../../domain/errors/DomainError";
import type { BookingStatus } from "../../domain/entities/Booking";
import { EventDispatcher } from "../events/EventDispatcher";
import { BookingStatusChangedEvent } from "../../domain/events/BookingStatusChangedEvent";

export interface UpdateBookingStatusInput {
  bookingId: string;
  status: string;
  userId: string;
}

export class UpdateBookingStatus {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(input: UpdateBookingStatusInput): Promise<BookingSummary> {
    if (input.status !== "APPROVED" && input.status !== "REJECTED") {
      throw new ValidationError("O status deve ser APPROVED ou REJECTED.");
    }

    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) throw new BookingNotFoundError();

    if (booking.accommodation.ownerId !== input.userId) {
      throw new ForbiddenError("Você não é proprietário desta acomodação.");
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

    const previousStatus = booking.status as BookingStatus;
    const newStatus = input.status as BookingStatus;
    const updated = await this.bookingRepository.updateStatus(input.bookingId, newStatus, "PENDING");

    this.eventDispatcher.dispatch(
      new BookingStatusChangedEvent(
        updated,
        previousStatus,
        newStatus,
        input.userId,
      )
    );

    return updated;
  }
}
