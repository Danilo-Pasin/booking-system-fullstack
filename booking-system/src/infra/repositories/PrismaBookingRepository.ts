import "dotenv/config";
import { Prisma } from "@prisma/client";
import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { AccommodationUnavailableError, BookingNotPendingError } from "../../domain/errors/DomainError";
import prisma from "../database/prisma";

export class PrismaBookingRepository implements BookingRepository {
  async save(booking: Booking): Promise<void> {
    await prisma.booking.create({
      data: {
        id:              booking.id,
        checkIn:         booking.checkIn,
        checkOut:        booking.checkOut,
        basePrice:       booking.basePrice,
        totalPrice:      booking.totalPrice,
        status:          booking.status as any,
        accommodationId: booking.accommodation.id,
        userId:          booking.userId,
      },
    });
  }

  async tryCreate(booking: Booking): Promise<void> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await prisma.$transaction(
          async (tx) => {
            const conflict = await tx.booking.findFirst({
              where: {
                accommodationId: booking.accommodation.id,
                status: { not: "REJECTED" },
                AND: [
                  { checkIn:  { lt: booking.checkOut } },
                  { checkOut: { gt: booking.checkIn  } },
                ],
              },
            });

            if (conflict) {
              throw new AccommodationUnavailableError();
            }

            await tx.booking.create({
              data: {
                id:              booking.id,
                checkIn:         booking.checkIn,
                checkOut:        booking.checkOut,
                basePrice:       booking.basePrice,
                totalPrice:      booking.totalPrice,
                status:          booking.status as any,
                accommodationId: booking.accommodation.id,
                userId:          booking.userId,
              },
            });
          },
          { isolationLevel: "Serializable" },
        );
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          (err.code === "P4000" || err.code === "40001")
        ) {
          continue;
        }
        throw err;
      }
    }
  }

  async findAll(): Promise<BookingSummary[]> {
    const bookings = await prisma.booking.findMany({
      include: { accommodation: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toSummary);
  }

  async findById(id: string): Promise<BookingSummary | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { accommodation: true, user: { select: { name: true } } },
    });
    if (!booking) return null;
    return this.toSummary(booking);
  }

  async hasConflict(accommodationId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const conflict = await prisma.booking.findFirst({
      where: {
        accommodationId,
        status: "APPROVED",
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
      include: { accommodation: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toSummary);
  }

  async findByAccommodationOwnerId(ownerId: string): Promise<BookingSummary[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        accommodation: { ownerId },
      },
      include: { accommodation: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toSummary);
  }

  async delete(id: string): Promise<void> {
    await prisma.booking.delete({ where: { id } });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingSummary> {
    try {
      const booking = await prisma.booking.update({
        where: { id, status: "PENDING" },
        data: { status: status as any },
        include: { accommodation: true, user: { select: { name: true } } },
      });
      return this.toSummary(booking);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
        throw new BookingNotPendingError(current?.status ?? "UNKNOWN");
      }
      throw err;
    }
  }

  private toSummary(booking: any): BookingSummary {
    return {
      id:         booking.id,
      checkIn:    booking.checkIn,
      checkOut:   booking.checkOut,
      basePrice:  booking.basePrice,
      totalPrice: booking.totalPrice,
      status:     booking.status,
      createdAt:  booking.createdAt,
      userId:     booking.userId,
      userName:   booking.user?.name ?? "",
      accommodation: {
        id:      booking.accommodation.id,
        name:    booking.accommodation.name,
        type:    booking.accommodation.type,
        ownerId: booking.accommodation.ownerId,
      },
    };
  }
}
