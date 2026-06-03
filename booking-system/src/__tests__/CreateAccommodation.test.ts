import { describe, it, expect } from "vitest";
import { CreateAccommodation } from "../application/use-cases/CreateAccommodation";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { ValidationError } from "../domain/errors/DomainError";
import { House } from "../domain/entities/House";
import { Apartment } from "../domain/entities/Apartment";
import { SharedRoom } from "../domain/entities/SharedRoom";

describe("CreateAccommodation", () => {
  const repo = new InMemoryAccommodationRepository();
  const useCase = new CreateAccommodation(repo);
  const ownerId = "host-123";

  it("creates a house with valid data", async () => {
    const result = await useCase.execute({
      name: "Beach House",
      type: "house",
      pricePerNight: 200,
      ownerId,
    });

    expect(result).toBeInstanceOf(House);
    expect(result.name).toBe("Beach House");
    expect(result.pricePerNight).toBe(200);
    expect(result.ownerId).toBe(ownerId);
    expect(result.description).toBeUndefined();
  });

  it("creates an apartment with description", async () => {
    const result = await useCase.execute({
      name: "Downtown Apt",
      type: "apartment",
      pricePerNight: 150,
      description: "Centrally located",
      ownerId,
    });

    expect(result).toBeInstanceOf(Apartment);
    expect(result.description).toBe("Centrally located");
  });

  it("creates a shared room", async () => {
    const result = await useCase.execute({
      name: "Hostel Room",
      type: "shared_room",
      pricePerNight: 50,
      ownerId,
    });

    expect(result).toBeInstanceOf(SharedRoom);
  });

  it("rejects invalid type", async () => {
    await expect(
      useCase.execute({
        name: "Invalid",
        type: "boat",
        pricePerNight: 100,
        ownerId,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("rejects non-positive price", async () => {
    await expect(
      useCase.execute({
        name: "Free Room",
        type: "house",
        pricePerNight: 0,
        ownerId,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("generates a unique id for each accommodation", async () => {
    const a = await useCase.execute({ name: "A", type: "house", pricePerNight: 100, ownerId });
    const b = await useCase.execute({ name: "B", type: "house", pricePerNight: 100, ownerId });

    expect(a.id).not.toBe(b.id);
  });
});
