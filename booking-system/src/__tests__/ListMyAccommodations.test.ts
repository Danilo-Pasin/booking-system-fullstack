import { describe, it, expect, beforeEach } from "vitest";
import { ListMyAccommodations } from "../application/use-cases/ListMyAccommodations";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { AccommodationFactory } from "../domain/factories/AccommodationFactory";

describe("ListMyAccommodations", () => {
  let repo: InMemoryAccommodationRepository;
  const factory = new AccommodationFactory();

  beforeEach(() => {
    repo = new InMemoryAccommodationRepository();
  });

  it("returns only the owner's accommodations", async () => {
    const useCase = new ListMyAccommodations(repo);

    await repo.save(
      factory.create({ id: "a1", name: "A", type: "house", pricePerNight: 100, ownerId: "host-a" }),
    );
    await repo.save(
      factory.create({ id: "a2", name: "B", type: "apartment", pricePerNight: 150, ownerId: "host-a" }),
    );
    await repo.save(
      factory.create({ id: "a3", name: "C", type: "shared_room", pricePerNight: 50, ownerId: "host-b" }),
    );

    const result = await useCase.execute({ ownerId: "host-a" });

    expect(result).toHaveLength(2);
    expect(result.every((a) => a.ownerId === "host-a")).toBe(true);
  });

  it("returns empty list when owner has no accommodations", async () => {
    const useCase = new ListMyAccommodations(repo);

    await repo.save(
      factory.create({ id: "a1", name: "A", type: "house", pricePerNight: 100, ownerId: "host-1" }),
    );

    const result = await useCase.execute({ ownerId: "other-host" });

    expect(result).toEqual([]);
  });
});
