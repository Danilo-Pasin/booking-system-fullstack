import { Booking, BookingStatus } from "../entities/Booking";

export interface BookingRepository {
  save(booking: Booking): Promise<void>;
  tryCreate(booking: Booking): Promise<void>;
  findAll(): Promise<BookingSummary[]>;
  findById(id: string): Promise<BookingSummary | null>;
  delete(id: string): Promise<void>;
  hasConflict(accommodationId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
  findByUserId(userId: string): Promise<BookingSummary[]>;
  findByAccommodationOwnerId(ownerId: string): Promise<BookingSummary[]>;
  updateStatus(id: string, status: BookingStatus): Promise<BookingSummary>;
}

export interface BookingSummary {
  id: string;
  checkIn: Date;
  checkOut: Date;
  basePrice: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  userId: string;
  userName: string;
  accommodation: {
    id: string;
    name: string;
    type: string;
    ownerId: string;
  };
}
