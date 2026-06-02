import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Accommodation } from "../../domain/entities/Accommodation";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { AccommodationFactory } from "../../domain/factories/AccommodationFactory";
import { AccommodationNotFoundError } from "../../domain/errors/DomainError";

const prisma = new PrismaClient();
const factory = new AccommodationFactory();

export class PrismaAccommodationRepository implements AccommodationRepository {
  async findById(id: string): Promise<Accommodation> {
    const raw = await prisma.accommodation.findUnique({ where: { id } });
    if (!raw) throw new AccommodationNotFoundError(id);
    return factory.create(raw);
  }

  async findAll(): Promise<Accommodation[]> {
    const all = await prisma.accommodation.findMany();
    return all.map((r) => factory.create(r));
  }

  async save(accommodation: Accommodation & { type: string }): Promise<void> {
    await prisma.accommodation.upsert({
      where: { id: accommodation.id },
      update: {},
      create: {
        id:            accommodation.id,
        name:          accommodation.name,
        type:          accommodation.type,
        pricePerNight: accommodation.pricePerNight,
      },
    });
  }
}