import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Accommodation } from "../../domain/entities/Accommodation";
import { House } from "../../domain/entities/House";
import { Apartment } from "../../domain/entities/Apartment";
import { SharedRoom } from "../../domain/entities/SharedRoom";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { AccommodationNotFoundError } from "../../domain/errors/DomainError";

const prisma = new PrismaClient();

// Reconstrói a classe correta a partir do tipo salvo no banco
function toEntity(raw: { id: string; name: string; type: string; pricePerNight: number }): Accommodation {
  const map: Record<string, Accommodation> = {
    house:       new House(raw.id, raw.name, raw.pricePerNight),
    apartment:   new Apartment(raw.id, raw.name, raw.pricePerNight),
    shared_room: new SharedRoom(raw.id, raw.name, raw.pricePerNight),
  };
  const entity = map[raw.type];
  if (!entity) throw new Error(`Unknown accommodation type: ${raw.type}`);
  return entity;
}

export class PrismaAccommodationRepository implements AccommodationRepository {
  async findById(id: string): Promise<Accommodation> {
  const raw = await prisma.accommodation.findUnique({ where: { id } });
  if (!raw) throw new AccommodationNotFoundError(id);
  return toEntity(raw);
  }

  async findAll(): Promise<Accommodation[]> {
    const all = await prisma.accommodation.findMany();
    return all.map(toEntity);
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