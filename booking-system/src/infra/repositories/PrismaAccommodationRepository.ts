import "dotenv/config";
import type { Accommodation } from "../../domain/entities/Accommodation";
import type { Image } from "../../domain/entities/Image";
import { AccommodationRepository, AccommodationFilters } from "../../domain/repositories/AccommodationRepository";
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
    images: raw.images?.map((i: any) => ({ id: i.id, url: i.url, order: i.order, isPrimary: i.isPrimary }) as Image) ?? [],
    ownerId: raw.ownerId,
  });
}

function buildWhereClause(filters?: AccommodationFilters) {
  if (!filters) return {};
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return where;
}

function buildOrderByClause(filters?: AccommodationFilters) {
  if (!filters?.sort) return undefined;
  switch (filters.sort) {
    case "price_asc": return { pricePerNight: "asc" as const };
    case "price_desc": return { pricePerNight: "desc" as const };
    case "name_asc": return { name: "asc" as const };
    default: return undefined;
  }
}

export class PrismaAccommodationRepository implements AccommodationRepository {
  async findById(id: string): Promise<Accommodation> {
    const raw = await prisma.accommodation.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!raw) throw new AccommodationNotFoundError();
    return toDomain(raw);
  }

  async findAll(filters?: AccommodationFilters): Promise<Accommodation[]> {
    const raw = await prisma.accommodation.findMany({
      where: buildWhereClause(filters),
      orderBy: buildOrderByClause(filters),
      include: IMAGE_INCLUDE,
    });
    return raw.map(toDomain);
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
            isPrimary: img.isPrimary ?? i === 0,
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
              isPrimary: img.isPrimary ?? i === 0,
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
