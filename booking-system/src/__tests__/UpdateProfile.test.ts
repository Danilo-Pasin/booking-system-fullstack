import { describe, it, expect } from "vitest";
import { UpdateProfile } from "../application/use-cases/UpdateProfile";
import { InMemoryUserRepository } from "../infra/repositories/InMemoryUserRepository";
import { NotFoundError } from "../domain/errors/DomainError";
import { User } from "../domain/entities/User";

describe("UpdateProfile", () => {
  const repo = new InMemoryUserRepository();
  const useCase = new UpdateProfile(repo);

  const user: User = {
    id: "user-1",
    name: "Old Name",
    email: "user@test.com",
    password: "hashed",
    role: "GUEST",
    avatarUrl: "https://avatar.com/old",
    bio: "Old bio",
    createdAt: new Date("2025-01-01"),
  };

  it("updates all fields", async () => {
    await repo.save(user);

    const result = await useCase.execute({
      userId: user.id,
      name: "New Name",
      avatarUrl: "https://avatar.com/new",
      bio: "New bio",
    });

    expect(result.name).toBe("New Name");
    expect(result.avatarUrl).toBe("https://avatar.com/new");
    expect(result.bio).toBe("New bio");
  });

  it("partially updates only the provided fields", async () => {
    await repo.save(user);

    const result = await useCase.execute({
      userId: user.id,
      name: "Only Name Changed",
    });

    expect(result.name).toBe("Only Name Changed");
    expect(result.avatarUrl).toBe(user.avatarUrl);
    expect(result.bio).toBe(user.bio);
  });

  it("throws NotFoundError when user does not exist", async () => {
    await expect(
      useCase.execute({ userId: "nonexistent", name: "Nope" })
    ).rejects.toThrow(NotFoundError);
  });
});
