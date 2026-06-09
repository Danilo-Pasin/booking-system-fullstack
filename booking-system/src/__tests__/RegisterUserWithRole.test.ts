import { describe, it, expect } from "vitest";
import { RegisterUser } from "../application/use-cases/RegisterUser";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { ValidationError, EmailAlreadyInUseError } from "../domain/errors/DomainError";
import { MockPasswordHasher } from "./MockPasswordHasher";

class InMemoryUserRepository {
  private users: any[] = [];

  async save(user: any) { this.users.push(user); }
  async findByEmail(email: string) { return this.users.find(u => u.email === email) ?? null; }
  async findById(id: string) { return this.users.find(u => u.id === id) ?? null; }
}

const hasher = new MockPasswordHasher();

describe("RegisterUser with role", () => {
  const repo = new InMemoryUserRepository() as any;
  const useCase = new RegisterUser(repo, hasher);

  it("defaults role to GUEST", async () => {
    const result = await useCase.execute({
      name: "Guest",
      email: "guest@test.com",
      password: "password123",
    });

    expect(result.role).toBe("GUEST");
  });

  it("accepts HOST role", async () => {
    const result = await useCase.execute({
      name: "Host",
      email: "host@test.com",
      password: "password123",
      role: "HOST",
    });

    expect(result.role).toBe("HOST");
  });

  it("rejects invalid role", async () => {
    await expect(
      useCase.execute({
        name: "Invalid",
        email: "invalid@test.com",
        password: "password123",
        role: "ADMIN" as any,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("rejects duplicate email", async () => {
    await useCase.execute({
      name: "First",
      email: "dup@test.com",
      password: "password123",
    });

    await expect(
      useCase.execute({
        name: "Second",
        email: "dup@test.com",
        password: "password123",
      })
    ).rejects.toThrow(EmailAlreadyInUseError);
  });
});
