import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { AccommodationUnavailableError, BookingNotPendingError, BookingNotFoundError } from "../../domain/errors/DomainError";

export class InMemoryBookingRepository implements BookingRepository {
  private readonly store = new Map<string, Booking>();

  private toSummary(booking: Booking): BookingSummary {
    return {
      id: booking.id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      basePrice: booking.basePrice,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      userId: booking.userId,
      userName: "",
      userEmail: undefined,
      accommodation: {
        id: booking.accommodation.id,
        name: booking.accommodation.name,
        type: booking.accommodation.type,
        ownerId: booking.accommodation.ownerId,
      },
    };
  }

  async save(booking: Booking): Promise<void> {
    this.store.set(booking.id, booking);
  }

  async tryCreate(booking: Booking): Promise<void> {
    const conflicting = Array.from(this.store.values()).find(
      (b) =>
        b.status === "APPROVED" &&
        b.accommodation.id === booking.accommodation.id &&
        b.checkIn < booking.checkOut &&
        b.checkOut > booking.checkIn,
    );
    if (conflicting) {
      throw new AccommodationUnavailableError();
    }
    this.store.set(booking.id, booking);
  }

  async updateStatus(id: string, status: BookingStatus, expectedStatus?: BookingStatus): Promise<BookingSummary> {
    const booking = this.store.get(id);
    if (!booking) throw new BookingNotFoundError();
    if (expectedStatus && booking.status !== expectedStatus) {
      throw new BookingNotPendingError(booking.status);
    }
    booking.status = status;
    return this.toSummary(booking);
  }

  async findAll(): Promise<BookingSummary[]> {
    return Array.from(this.store.values()).map((b) => this.toSummary(b));
  }

  async findById(id: string): Promise<BookingSummary | null> {
    const booking = this.store.get(id);
    return booking ? this.toSummary(booking) : null;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async hasConflict(accommodationId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<boolean> {
    return Array.from(this.store.values()).some(
      (b) =>
        b.id !== excludeBookingId &&
        b.status === "APPROVED" &&
        b.accommodation.id === accommodationId &&
        b.checkIn < checkOut &&
        b.checkOut > checkIn,
    );
  }

  async findByUserId(userId: string, statuses?: BookingStatus[]): Promise<BookingSummary[]> {
    return Array.from(this.store.values())
      .filter((b) => b.userId === userId && (!statuses || statuses.includes(b.status)))
      .map((b) => this.toSummary(b));
  }

  async findByAccommodationOwnerId(ownerId: string): Promise<BookingSummary[]> {
    return Array.from(this.store.values())
      .filter((b) => b.accommodation.ownerId === ownerId)
      .map((b) => this.toSummary(b));
  }
}
