import "dotenv/config";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import prisma from "../database/prisma";

const USER_IMAGE_INCLUDE = { images: { orderBy: { order: "asc" as const } } };

function toDomain(raw: any): User {
  return {
    ...raw,
    avatarUrl: raw.avatarUrl ?? undefined,
    bio: raw.bio ?? undefined,
    images: raw.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      order: img.order,
      isPrimary: img.isPrimary,
    })) ?? undefined,
  };
}

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
        images: {
          create: (user.images ?? []).map((img, i) => ({
            id: img.id,
            url: img.url,
            order: img.order ?? i,
            isPrimary: img.isPrimary ?? i === 0,
          })),
        },
      },
    });
  }

  async update(user: User): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.image.deleteMany({ where: { userId: user.id } });
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
          bio: user.bio ?? null,
          ...(user.password ? { password: user.password } : {}),
          images: {
            create: (user.images ?? []).map((img, i) => ({
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

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { email },
      include: USER_IMAGE_INCLUDE,
    });
    return raw ? toDomain(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
      include: USER_IMAGE_INCLUDE,
    });
    return raw ? toDomain(raw) : null;
  }
}
