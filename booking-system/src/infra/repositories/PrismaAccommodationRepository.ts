import "dotenv/config";
import type { Accommodation } from "../../domain/entities/Accommodation";
import type { Image } from "../../domain/entities/Image";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { AccommodationFactory } from "../../domain/factories/AccommodationFactory";
import { AccommodationNotFoundError } from "../../domain/errors/DomainError";
import prisma from "../database/prisma";

const factory = new AccommodationFactory();
const IMAGE_INCLUDE = { images: { orderBy: { order: "asc" as const } } };

function toDomain(raw: any): Accommodation {
  return factory.create({
    id: raw.id,
    name: raw.name,
    type: raw.type,
    pricePerNight: raw.pricePerNight,
    description: raw.description,
    imageUrl: raw.imageUrl,
    images: raw.images?.map((i: any) => ({ id: i.id, url: i.url, order: i.order }) as Image) ?? [],
    ownerId: raw.ownerId,
  });
}

export class PrismaAccommodationRepository implements AccommodationRepository {
  async findById(id: string): Promise<Accommodation> {
    const raw = await prisma.accommodation.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!raw) throw new AccommodationNotFoundError();
    return toDomain(raw);
  }

  async findAll(): Promise<Accommodation[]> {
    console.log("[PrismaAccommodationRepository.findAll] entry");
    try {
      const all = await prisma.accommodation.findMany({ include: IMAGE_INCLUDE });
      console.log("[PrismaAccommodationRepository.findAll] exit — count:", all.length);
      return all.map(toDomain);
    } catch (err) {
      console.error("[PrismaAccommodationRepository.findAll] ERROR:", (err as Error).constructor?.name, (err as Error).message);
      if ((err as any).code) console.error("[PrismaAccommodationRepository.findAll] Prisma code:", (err as any).code);
      throw err;
    }
  }

  async findByOwnerId(ownerId: string): Promise<Accommodation[]> {
    const all = await prisma.accommodation.findMany({ where: { ownerId }, include: IMAGE_INCLUDE });
    return all.map(toDomain);
  }

  async save(accommodation: Accommodation): Promise<void> {
    await prisma.accommodation.create({
      data: {
        id: accommodation.id,
        name: accommodation.name,
        type: accommodation.type,
        pricePerNight: accommodation.pricePerNight,
        description: (accommodation as any).description ?? null,
        imageUrl: (accommodation as any).imageUrl ?? null,
        ownerId: accommodation.ownerId,
        images: {
          create: (accommodation.images ?? []).map((img, i) => ({
            id: img.id,
            url: img.url,
            order: img.order ?? i,
          })),
        },
      },
    });
  }

  async update(accommodation: Accommodation): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.image.deleteMany({ where: { accommodationId: accommodation.id } });
      await tx.accommodation.update({
        where: { id: accommodation.id },
        data: {
          name: accommodation.name,
          type: accommodation.type,
          pricePerNight: accommodation.pricePerNight,
          description: (accommodation as any).description ?? null,
          imageUrl: (accommodation as any).imageUrl ?? null,
          images: {
            create: (accommodation.images ?? []).map((img, i) => ({
              id: img.id,
              url: img.url,
              order: img.order ?? i,
            })),
          },
        },
      });
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.accommodation.delete({ where: { id } });
  }
}
