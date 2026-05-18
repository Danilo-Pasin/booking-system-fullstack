import { Booking } from "../entities/Booking";

export interface BookingRepository {
  save(booking: Booking): Promise<void>;
  findAll(): Promise<BookingSummary[]>;
  findById(id: string): Promise<BookingSummary | null>;
  delete(id: string): Promise<void>;
  hasConflict(accommodationId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
}

export interface BookingSummary {
  id: string;
  checkIn: Date;
  checkOut: Date;
  basePrice: number;
  totalPrice: number;
  createdAt: Date;
  accommodation: {
    id: string;
    name: string;
    type: string;
  };
}