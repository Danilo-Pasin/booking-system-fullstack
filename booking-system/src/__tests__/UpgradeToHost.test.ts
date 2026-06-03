import { describe, it, expect } from "vitest";
import { UpgradeToHost } from "../application/use-cases/UpgradeToHost";
import { InMemoryUserRepository } from "../infra/repositories/InMemoryUserRepository";
import { AlreadyHostError, NotFoundError } from "../domain/errors/DomainError";
import { User } from "../domain/entities/User";

describe("UpgradeToHost", () => {
  const repo = new InMemoryUserRepository();
  const useCase = new UpgradeToHost(repo);

  const guestUser: User = {
    id: "user-1",
    name: "Guest",
    email: "guest@test.com",
    password: "hashed",
    role: "GUEST",
    avatarUrl: "https://avatar.com/1",
    bio: "A guest",
    createdAt: new Date("2025-01-01"),
  };

  const hostUser: User = {
    ...guestUser,
    id: "user-2",
    email: "host@test.com",
    role: "HOST",
  };

  it("upgrades guest to host", async () => {
    await repo.save(guestUser);

    const result = await useCase.execute({ userId: guestUser.id });

    expect(result.role).toBe("HOST");
    expect(result.id).toBe(guestUser.id);
    expect(result.email).toBe(guestUser.email);
  });

  it("throws AlreadyHostError when user is already a host", async () => {
    await repo.save(hostUser);

    await expect(useCase.execute({ userId: hostUser.id })).rejects.toThrow(AlreadyHostError);
  });

  it("throws NotFoundError when user does not exist", async () => {
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow(NotFoundError);
  });
});
