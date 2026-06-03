import { describe, it, expect } from "vitest";
import { AccommodationFactory } from "../domain/factories/AccommodationFactory";
import { House } from "../domain/entities/House";
import { Apartment } from "../domain/entities/Apartment";
import { SharedRoom } from "../domain/entities/SharedRoom";

describe("AccommodationFactory", () => {
  const factory = new AccommodationFactory();

  const ownerId = "host-1";

  it("creates a House when type is 'house'", () => {
    const result = factory.create({
      id: "h-001",
      name: "Casa na Praia",
      type: "house",
      pricePerNight: 200,
      ownerId,
    });

    expect(result).toBeInstanceOf(House);
    expect(result.id).toBe("h-001");
    expect(result.name).toBe("Casa na Praia");
    expect(result.pricePerNight).toBe(200);
    expect(result.type).toBe("house");
    expect(result.ownerId).toBe(ownerId);
  });

  it("creates an Apartment when type is 'apartment'", () => {
    const result = factory.create({
      id: "a-001",
      name: "Apartamento Centro",
      type: "apartment",
      pricePerNight: 150,
      ownerId,
    });

    expect(result).toBeInstanceOf(Apartment);
    expect(result.id).toBe("a-001");
    expect(result.name).toBe("Apartamento Centro");
    expect(result.pricePerNight).toBe(150);
    expect(result.type).toBe("apartment");
    expect(result.ownerId).toBe(ownerId);
  });

  it("creates a SharedRoom when type is 'shared_room'", () => {
    const result = factory.create({
      id: "s-001",
      name: "Quarto Compartilhado",
      type: "shared_room",
      pricePerNight: 50,
      ownerId,
    });

    expect(result).toBeInstanceOf(SharedRoom);
    expect(result.id).toBe("s-001");
    expect(result.name).toBe("Quarto Compartilhado");
    expect(result.pricePerNight).toBe(50);
    expect(result.type).toBe("shared_room");
    expect(result.ownerId).toBe(ownerId);
  });

  it("throws for an unknown type", () => {
    expect(() =>
      factory.create({
        id: "x-001",
        name: "Unknown",
        type: "boat",
        pricePerNight: 100,
        ownerId,
      })
    ).toThrow("Invalid accommodation type: boat");
  });
});
