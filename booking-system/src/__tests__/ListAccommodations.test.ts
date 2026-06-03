import { describe, it, expect, beforeEach } from "vitest";
import { ListAccommodations } from "../application/use-cases/ListAccommodations";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { AccommodationFactory } from "../domain/factories/AccommodationFactory";

describe("ListAccommodations", () => {
  let repo: InMemoryAccommodationRepository;
  const factory = new AccommodationFactory();

  beforeEach(() => {
    repo = new InMemoryAccommodationRepository();
  });

  it("returns all accommodations", async () => {
    const useCase = new ListAccommodations(repo);

    await repo.save(
      factory.create({ id: "a1", name: "A", type: "house", pricePerNight: 100, ownerId: "host-1" }),
    );
    await repo.save(
      factory.create({ id: "a2", name: "B", type: "apartment", pricePerNight: 150, ownerId: "host-1" }),
    );
    await repo.save(
      factory.create({ id: "a3", name: "C", type: "shared_room", pricePerNight: 50, ownerId: "host-2" }),
    );

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
  });

  it("returns empty list when there are no accommodations", async () => {
    const useCase = new ListAccommodations(repo);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
