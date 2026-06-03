import { describe, it, expect } from "vitest";
import { GetAccommodationById } from "../application/use-cases/GetAccommodationById";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { AccommodationFactory } from "../domain/factories/AccommodationFactory";
import { AccommodationNotFoundError } from "../domain/errors/DomainError";

describe("GetAccommodationById", () => {
  const repo = new InMemoryAccommodationRepository();
  const factory = new AccommodationFactory();
  const useCase = new GetAccommodationById(repo);

  it("returns the accommodation when found", async () => {
    await repo.save(
      factory.create({
        id: "a1",
        name: "Beach House",
        type: "house",
        pricePerNight: 200,
        ownerId: "host-1",
      }),
    );

    const result = await useCase.execute({ id: "a1" });

    expect(result.id).toBe("a1");
    expect(result.name).toBe("Beach House");
    expect(result.pricePerNight).toBe(200);
    expect(result.type).toBe("house");
    expect(result.ownerId).toBe("host-1");
  });

  it("throws AccommodationNotFoundError when not found", async () => {
    await expect(useCase.execute({ id: "non-existent" })).rejects.toThrow(
      AccommodationNotFoundError,
    );
  });
});
