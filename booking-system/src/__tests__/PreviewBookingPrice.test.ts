import { describe, it, expect, vi, beforeEach } from "vitest";
import { PreviewBookingPrice } from "../application/use-cases/PreviewBookingPrice";
import { House } from "../domain/entities/House";
import { AccommodationNotFoundError } from "../domain/errors/DomainError";

const mockHouse = new House("acc-1", "Test House", 200);

describe("PreviewBookingPrice", () => {
  let mockAccommodationRepo: { findById: ReturnType<typeof vi.fn> };
  let mockPricingService: { calculate: ReturnType<typeof vi.fn> };
  let useCase: PreviewBookingPrice;

  beforeEach(() => {
    mockAccommodationRepo = { findById: vi.fn().mockResolvedValue(mockHouse) };
    mockPricingService = {
      calculate: vi.fn().mockReturnValue({
        days: 3,
        base: 1080,
        fees: [{ name: "Taxa da Plataforma", amount: 63.18 }],
        total: 1143.18,
      }),
    };
    useCase = new PreviewBookingPrice(
      mockAccommodationRepo as any,
      mockPricingService as any,
    );
  });

  it("returns pricing breakdown for valid accommodation", async () => {
    const result = await useCase.execute({
      accommodationId: "acc-1",
      checkIn: new Date("2026-07-10"),
      checkOut: new Date("2026-07-13"),
    });

    expect(result).toBeDefined();
    expect(result.base).toBe(1080);
    expect(result.fees).toHaveLength(1);
    expect(result.total).toBe(1143.18);
  });

  it("throws AccommodationNotFoundError when accommodation does not exist", async () => {
    mockAccommodationRepo.findById.mockRejectedValue(new AccommodationNotFoundError());

    await expect(
      useCase.execute({
        accommodationId: "nonexistent",
        checkIn: new Date("2026-07-10"),
        checkOut: new Date("2026-07-13"),
      }),
    ).rejects.toThrow(AccommodationNotFoundError);
  });
});
