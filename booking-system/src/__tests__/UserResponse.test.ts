import { describe, it, expect } from "vitest";
import { toUserResponse } from "../application/use-cases/UserResponse";
import { User } from "../domain/entities/User";

describe("toUserResponse", () => {
  const createdAt = new Date("2025-06-01T12:00:00Z");

  const fullUser: User = {
    id: "user-1",
    name: "John Doe",
    email: "john@test.com",
    password: "hashed",
    role: "GUEST",
    avatarUrl: "https://avatar.com/john",
    bio: "Hello there",
    createdAt,
  };

  it("maps all fields when avatarUrl and bio are present", () => {
    const result = toUserResponse(fullUser);

    expect(result.avatarUrl).toBe("https://avatar.com/john");
    expect(result.bio).toBe("Hello there");
  });

  it("maps avatarUrl and bio to null when they are undefined", () => {
    const user: User = {
      ...fullUser,
      avatarUrl: undefined,
      bio: undefined,
    };

    const result = toUserResponse(user);

    expect(result.avatarUrl).toBeNull();
    expect(result.bio).toBeNull();
  });

  it("maps avatarUrl and bio to null when they are null", () => {
    const user: User = {
      ...fullUser,
      avatarUrl: null as unknown as undefined,
      bio: null as unknown as undefined,
      name: "Null User",
    };

    const result = toUserResponse(user);

    expect(result.avatarUrl).toBeNull();
    expect(result.bio).toBeNull();
  });

  it("returns all fields correctly", () => {
    const result = toUserResponse(fullUser);

    expect(result.id).toBe("user-1");
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@test.com");
    expect(result.role).toBe("GUEST");
    expect(result.createdAt).toBe(createdAt);
  });
});
