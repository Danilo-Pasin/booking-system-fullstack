import { describe, it, expect } from "vitest";
import { authenticate, requireHost } from "../infra/http/middleware/auth.middleware";
import { UnauthorizedError, HostOnlyError } from "../domain/errors/DomainError";
import { InMemoryUserRepository } from "../infra/repositories/InMemoryUserRepository";
import { User } from "../domain/entities/User";

function mockRequest(jwtVerify: () => Promise<void>, user?: { id: string }) {
  return { jwtVerify, user } as any;
}

function mockReply() {
  return {} as any;
}

describe("authenticate", () => {
  it("passes when jwtVerify resolves", async () => {
    const req = mockRequest(async () => {});
    await expect(authenticate(req, mockReply())).resolves.toBeUndefined();
  });

  it("throws UnauthorizedError when jwtVerify rejects", async () => {
    const req = mockRequest(async () => { throw new Error("token expired"); });
    await expect(authenticate(req, mockReply())).rejects.toThrow(UnauthorizedError);
  });
});

describe("requireHost", () => {
  const hostUser: User = {
    id: "host-1",
    name: "Host",
    email: "host@test.com",
    password: "hashed",
    role: "HOST",
    createdAt: new Date(),
  };
  const guestUser: User = {
    id: "guest-1",
    name: "Guest",
    email: "guest@test.com",
    password: "hashed",
    role: "GUEST",
    createdAt: new Date(),
  };

  it("passes when user is a HOST", async () => {
    const repo = new InMemoryUserRepository();
    await repo.save(hostUser);
    const req = mockRequest(async () => {}, { id: "host-1" });

    await expect(requireHost(repo)(req, mockReply())).resolves.toBeUndefined();
  });

  it("throws HostOnlyError when user is a GUEST", async () => {
    const repo = new InMemoryUserRepository();
    await repo.save(guestUser);
    const req = mockRequest(async () => {}, { id: "guest-1" });

    await expect(requireHost(repo)(req, mockReply())).rejects.toThrow(HostOnlyError);
  });

  it("throws HostOnlyError when user is not found", async () => {
    const repo = new InMemoryUserRepository();
    const req = mockRequest(async () => {}, { id: "nonexistent" });

    await expect(requireHost(repo)(req, mockReply())).rejects.toThrow(HostOnlyError);
  });
});
