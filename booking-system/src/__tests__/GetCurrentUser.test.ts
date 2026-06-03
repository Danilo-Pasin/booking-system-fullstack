import { describe, it, expect } from "vitest";
import { GetCurrentUser } from "../application/use-cases/GetCurrentUser";
import { InMemoryUserRepository } from "../infra/repositories/InMemoryUserRepository";
import { NotFoundError } from "../domain/errors/DomainError";
import { User } from "../domain/entities/User";

describe("GetCurrentUser", () => {
  const repo = new InMemoryUserRepository();
  const useCase = new GetCurrentUser(repo);

  const user: User = {
    id: "user-1",
    name: "John Doe",
    email: "john@test.com",
    password: "hashed",
    role: "GUEST",
    avatarUrl: "https://avatar.com/john",
    bio: "Hello!",
    createdAt: new Date("2025-06-01"),
  };

  it("returns user response when user is found", async () => {
    await repo.save(user);

    const result = await useCase.execute({ userId: user.id });

    expect(result.id).toBe(user.id);
    expect(result.name).toBe(user.name);
    expect(result.email).toBe(user.email);
    expect(result.role).toBe(user.role);
    expect(result.avatarUrl).toBe(user.avatarUrl);
    expect(result.bio).toBe(user.bio);
    expect(result.createdAt).toEqual(user.createdAt);
  });

  it("throws NotFoundError when user does not exist", async () => {
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow(NotFoundError);
  });
});
