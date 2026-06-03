import { describe, it, expect, beforeEach } from "vitest";
import { DeleteAccommodation } from "../application/use-cases/DeleteAccommodation";
import { CreateAccommodation } from "../application/use-cases/CreateAccommodation";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { NotOwnerError } from "../domain/errors/DomainError";

describe("DeleteAccommodation", () => {
  const repo = new InMemoryAccommodationRepository();
  const createUseCase = new CreateAccommodation(repo);
  const deleteUseCase = new DeleteAccommodation(repo);
  const ownerId = "host-123";
  let accommodationId: string;

  beforeEach(async () => {
    const a = await createUseCase.execute({
      name: "To Delete",
      type: "house",
      pricePerNight: 100,
      ownerId,
    });
    accommodationId = a.id;
  });

  it("deletes own accommodation", async () => {
    await expect(
      deleteUseCase.execute({ id: accommodationId, ownerId })
    ).resolves.toBeUndefined();

    await expect(repo.findById(accommodationId)).rejects.toThrow();
  });

  it("rejects delete by non-owner", async () => {
    await expect(
      deleteUseCase.execute({ id: accommodationId, ownerId: "other-host" })
    ).rejects.toThrow(NotOwnerError);
  });
});
