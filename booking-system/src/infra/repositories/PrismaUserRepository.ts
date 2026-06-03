import "dotenv/config";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import prisma from "../database/prisma";

function toDomain(raw: any): User {
  return {
    ...raw,
    avatarUrl: raw.avatarUrl ?? undefined,
    bio: raw.bio ?? undefined,
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
      },
    });
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { email } });
    return raw ? toDomain(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    console.log("[PrismaUserRepository.findById] entry id:", id);
    try {
      const raw = await prisma.user.findUnique({ where: { id } });
      console.log("[PrismaUserRepository.findById] exit", raw ? "found" : "not found");
      return raw ? toDomain(raw) : null;
    } catch (err) {
      console.error("[PrismaUserRepository.findById] ERROR:", (err as Error).constructor?.name, (err as Error).message);
      if ((err as any).code) console.error("[PrismaUserRepository.findById] Prisma code:", (err as any).code);
      throw err;
    }
  }
}
