import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Booking } from "../../domain/entities/Booking";
import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";

const prisma = new PrismaClient();

export class PrismaBookingRepository implements BookingRepository {
  async save(booking: Booking): Promise<void> {
    await prisma.booking.create({
      data: {
        id:              booking.id,
        checkIn:         booking.checkIn,
        checkOut:        booking.checkOut,
        basePrice:       booking.basePrice,
        totalPrice:      booking.totalPrice,
        accommodationId: booking.accommodation.id,
        userId:          booking.userId,
      },
    });
  }

  async findAll(): Promise<BookingSummary[]> {
    const bookings = await prisma.booking.findMany({
      include: { accommodation: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toSummary);
  }

  async findById(id: string): Promise<BookingSummary | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { accommodation: true },
    });
    if (!booking) return null;
    return this.toSummary(booking);
  }
  async hasConflict(accommodationId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const conflict = await prisma.booking.findFirst({
      where: {
        accommodationId,
        AND: [
          { checkIn:  { lt: checkOut } },
          { checkOut: { gt: checkIn  } },
        ],
      },
    });
    return conflict !== null;
  }

  async findByUserId(userId: string): Promise<BookingSummary[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { accommodation: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toSummary);
  }

  async delete(id: string): Promise<void> {
    await prisma.booking.delete({ where: { id } });
  }

  private toSummary(booking: any): BookingSummary {
    return {
      id:         booking.id,
      checkIn:    booking.checkIn,
      checkOut:   booking.checkOut,
      basePrice:  booking.basePrice,
      totalPrice: booking.totalPrice,
      createdAt:  booking.createdAt,
      userId:     booking.userId,
      accommodation: {
        id:   booking.accommodation.id,
        name: booking.accommodation.name,
        type: booking.accommodation.type,
      },
    };
  }
}