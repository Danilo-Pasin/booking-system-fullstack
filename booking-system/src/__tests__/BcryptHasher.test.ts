import { describe, it, expect } from "vitest";
import { BcryptHasher } from "../infra/crypto/BcryptHasher";

describe("BcryptHasher", () => {
  const hasher = new BcryptHasher();

  it("hash returns a different string from the input", async () => {
    const hash = await hasher.hash("my-password");
    expect(hash).not.toBe("my-password");
  });

  it("hash produces different outputs each time (salt)", async () => {
    const hash1 = await hasher.hash("my-password");
    const hash2 = await hasher.hash("my-password");
    expect(hash1).not.toBe(hash2);
  });

  it("compare returns true for the correct password", async () => {
    const hash = await hasher.hash("my-password");
    const result = await hasher.compare("my-password", hash);
    expect(result).toBe(true);
  });

  it("compare returns false for an incorrect password", async () => {
    const hash = await hasher.hash("my-password");
    const result = await hasher.compare("wrong-password", hash);
    expect(result).toBe(false);
  });
});
