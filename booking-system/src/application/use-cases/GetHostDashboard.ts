import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";

export interface GetHostDashboardInput {
  ownerId: string;
}

export interface HostDashboardResult {
  accommodationsCount: number;
  bookingsCount: number;
  estimatedRevenue: number;
  pendingBookings: BookingSummary[];
}

export class GetHostDashboard {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: GetHostDashboardInput): Promise<HostDashboardResult> {
    const accommodations = await this.accommodationRepository.findByOwnerId(input.ownerId);
    const bookings = await this.bookingRepository.findByAccommodationOwnerId(input.ownerId);

    const activeBookings = bookings.filter(b => b.status !== "CANCELED" && b.status !== "REJECTED");
    const estimatedRevenue = bookings
      .filter(b => b.status === "APPROVED")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const pendingBookings = bookings.filter(b => b.status === "PENDING");

    return {
      accommodationsCount: accommodations.length,
      bookingsCount: activeBookings.length,
      estimatedRevenue,
      pendingBookings,
    };
  }
}
