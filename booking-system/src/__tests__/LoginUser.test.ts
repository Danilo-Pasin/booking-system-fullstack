import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import { LoginUser } from "../application/use-cases/LoginUser";
import { UserRepository } from "../domain/repositories/UserRepository";
import { User } from "../domain/entities/User";
import { InvalidCredentialsError } from "../domain/errors/DomainError";

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
  compare: vi.fn(),
}));

class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  add(user: User): void {
    this.store.set(user.id, user);
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.store.values()).find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
}

describe("LoginUser", () => {
  let repo: InMemoryUserRepository;
  let useCase: LoginUser;
  const mockUser: User = {
    id: "user-1",
    name: "John",
    email: "john@test.com",
    password: "hashed-password",
    role: "GUEST",
    createdAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new InMemoryUserRepository();
    repo.add(mockUser);
    useCase = new LoginUser(repo);
  });

  it("returns user response on valid credentials", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await useCase.execute({ email: "john@test.com", password: "password123" });

    expect(result.id).toBe("user-1");
    expect(result.name).toBe("John");
    expect(result.email).toBe("john@test.com");
    expect(result.role).toBe("GUEST");
  });

  it("throws InvalidCredentialsError when password is wrong", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      useCase.execute({ email: "john@test.com", password: "wrong" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError when email is not found", async () => {
    await expect(
      useCase.execute({ email: "unknown@test.com", password: "password123" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("returns the correct shape on successful login", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await useCase.execute({ email: "john@test.com", password: "password123" });

    expect(result).toMatchObject({
      id: "user-1",
      name: "John",
      email: "john@test.com",
      role: "GUEST",
      avatarUrl: null,
      bio: null,
      createdAt: mockUser.createdAt,
    });
  });
});
