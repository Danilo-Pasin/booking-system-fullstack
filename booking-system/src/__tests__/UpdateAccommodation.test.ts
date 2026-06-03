import { describe, it, expect, beforeEach } from "vitest";
import { UpdateAccommodation } from "../application/use-cases/UpdateAccommodation";
import { CreateAccommodation } from "../application/use-cases/CreateAccommodation";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { NotOwnerError, ValidationError } from "../domain/errors/DomainError";

describe("UpdateAccommodation", () => {
  const repo = new InMemoryAccommodationRepository();
  const createUseCase = new CreateAccommodation(repo);
  const updateUseCase = new UpdateAccommodation(repo);
  const ownerId = "host-123";
  let accommodationId: string;

  beforeEach(async () => {
    const a = await createUseCase.execute({
      name: "Original Name",
      type: "house",
      pricePerNight: 200,
      ownerId,
    });
    accommodationId = a.id;
  });

  it("updates the name", async () => {
    const updated = await updateUseCase.execute({
      id: accommodationId,
      name: "Updated Name",
      ownerId,
    });

    expect(updated.name).toBe("Updated Name");
  });

  it("updates the price", async () => {
    const updated = await updateUseCase.execute({
      id: accommodationId,
      pricePerNight: 350,
      ownerId,
    });

    expect(updated.pricePerNight).toBe(350);
  });

  it("updates the description", async () => {
    const updated = await updateUseCase.execute({
      id: accommodationId,
      description: "New description",
      ownerId,
    });

    expect((updated as any).description).toBe("New description");
  });

  it("rejects update by non-owner", async () => {
    await expect(
      updateUseCase.execute({
        id: accommodationId,
        name: "Hacked",
        ownerId: "other-host",
      })
    ).rejects.toThrow(NotOwnerError);
  });

  it("rejects non-positive price", async () => {
    await expect(
      updateUseCase.execute({
        id: accommodationId,
        pricePerNight: -10,
        ownerId,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("keeps fields unchanged when not provided", async () => {
    const updated = await updateUseCase.execute({
      id: accommodationId,
      ownerId,
    });

    expect(updated.name).toBe("Original Name");
    expect(updated.pricePerNight).toBe(200);
  });
});
