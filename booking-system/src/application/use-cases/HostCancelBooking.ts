import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { BookingNotFoundError, ForbiddenError, ValidationError } from "../../domain/errors/DomainError";
import { EventDispatcher } from "../events/EventDispatcher";
import { BookingStatusChangedEvent } from "../../domain/events/BookingStatusChangedEvent";
import type { BookingStatus } from "../../domain/entities/Booking";

export interface HostCancelBookingInput {
  bookingId: string;
  userId: string;
}

export class HostCancelBooking {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(input: HostCancelBookingInput): Promise<BookingSummary> {
    const booking = await this.bookingRepository.findById(input.bookingId);

    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.accommodation.ownerId !== input.userId) {
      throw new ForbiddenError("Você não é proprietário desta acomodação.");
    }

    if (booking.status === "REJECTED" || booking.status === "CANCELED") {
      throw new ValidationError(
        "Esta reserva não pode ser cancelada pois já está " +
        (booking.status === "REJECTED" ? "recusada" : "cancelada") + "."
      );
    }

    const previousStatus = booking.status as BookingStatus;
    const updated = await this.bookingRepository.updateStatus(input.bookingId, "CANCELED");

    this.eventDispatcher.dispatch(
      new BookingStatusChangedEvent(
        updated,
        previousStatus,
        "CANCELED",
        input.userId,
      )
    );

    return updated;
  }
}
