import { describe, it, expect } from "vitest";
import { GetPublicProfile } from "../application/use-cases/GetPublicProfile";
import { InMemoryUserRepository } from "../infra/repositories/InMemoryUserRepository";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { NotFoundError } from "../domain/errors/DomainError";
import { User } from "../domain/entities/User";

describe("GetPublicProfile", () => {
  const userRepo = new InMemoryUserRepository();
  const accommodationRepo = new InMemoryAccommodationRepository();
  const useCase = new GetPublicProfile(userRepo, accommodationRepo);

  const user: User = {
    id: "user-1",
    name: "Jane Host",
    email: "jane@test.com",
    password: "hashed",
    role: "HOST",
    avatarUrl: "https://avatar.com/jane",
    bio: "I love hosting",
    createdAt: new Date("2025-01-01"),
  };

  function makeAccommodation(id: string): Parameters<typeof accommodationRepo.save>[0] {
    return {
      id,
      name: "Place " + id,
      type: "house",
      ownerId: user.id,
      pricePerNight: 100,
      calculatePrice: () => 100,
    };
  }

  it("returns profile with accommodation count > 0", async () => {
    await userRepo.save(user);
    await accommodationRepo.save(makeAccommodation("acc-1"));
    await accommodationRepo.save(makeAccommodation("acc-2"));

    const result = await useCase.execute({ userId: user.id });

    expect(result.id).toBe(user.id);
    expect(result.name).toBe(user.name);
    expect(result.role).toBe(user.role);
    expect(result.avatarUrl).toBe(user.avatarUrl);
    expect(result.bio).toBe(user.bio);
    expect(result.accommodationCount).toBe(2);
    expect(result.createdAt).toEqual(user.createdAt);
  });

  it("returns profile with accommodation count 0", async () => {
    const newUser: User = {
      id: "user-2",
      name: "Bob Guest",
      email: "bob@test.com",
      password: "hashed",
      role: "GUEST",
      createdAt: new Date("2025-02-01"),
    };
    await userRepo.save(newUser);

    const result = await useCase.execute({ userId: newUser.id });

    expect(result.accommodationCount).toBe(0);
  });

  it("throws NotFoundError when user does not exist", async () => {
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow(NotFoundError);
  });
});
