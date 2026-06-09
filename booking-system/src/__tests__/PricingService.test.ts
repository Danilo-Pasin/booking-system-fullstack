import { describe, it, expect } from "vitest";
import { PricingService } from "../application/services/PricingService";
import { PlatformFee, ServiceFee, LongStayDiscount, CleaningFee } from "../domain/fees/Fee";

describe("PricingService", () => {
  it("calculates total with platform fee only", () => {
    const service = new PricingService([new PlatformFee()]);
    const result = service.calculate(1000, 5);

    expect(result.days).toBe(5);
    expect(result.base).toBe(1000);
    expect(result.fees).toHaveLength(1);
    expect(result.fees[0].name).toBe("Taxa da Plataforma");
    expect(result.fees[0].amount).toBeCloseTo(58.5);
    expect(result.total).toBeCloseTo(1058.5);
  });

  it("calculates total with multiple fees", () => {
    const service = new PricingService([new PlatformFee(), new ServiceFee(0.03)]);
    const result = service.calculate(1000, 3);

    expect(result.days).toBe(3);
    expect(result.fees).toHaveLength(2);
    expect(result.fees[0].name).toBe("Taxa da Plataforma");
    expect(result.fees[0].amount).toBeCloseTo(58.5);
    expect(result.fees[1].name).toBe("Taxa de Serviço");
    expect(result.fees[1].amount).toBeCloseTo(30);
    expect(result.total).toBeCloseTo(1088.5);
  });

  it("calculates total with fixed cleaning fee", () => {
    const service = new PricingService([new CleaningFee(80)]);
    const result = service.calculate(500, 2);

    expect(result.days).toBe(2);
    expect(result.fees[0].amount).toBe(80);
    expect(result.total).toBe(580);
  });

  it("applies long stay discount when days > 7", () => {
    const service = new PricingService([new LongStayDiscount()]);
    const result = service.calculate(1000, 10);

    expect(result.days).toBe(10);
    expect(result.fees[0].name).toBe("Desconto para Longa Permanência (10%)");
    expect(result.fees[0].amount).toBe(-100);
    expect(result.total).toBe(900);
  });

  it("does not apply long stay discount when days <= 7", () => {
    const service = new PricingService([new LongStayDiscount()]);
    const result = service.calculate(1000, 3);

    expect(result.days).toBe(3);
    expect(result.fees[0].amount).toBe(0);
    expect(result.total).toBe(1000);
  });

  it("calculates total with fees and discount combined", () => {
    const service = new PricingService([
      new PlatformFee(),
      new ServiceFee(0.03),
      new LongStayDiscount(),
    ]);
    const result = service.calculate(1000, 10);

    expect(result.days).toBe(10);
    expect(result.fees).toHaveLength(3);
    const platformFee = result.fees.find((f) => f.name === "Taxa da Plataforma")!;
    const serviceFee = result.fees.find((f) => f.name === "Taxa de Serviço")!;
    const discount = result.fees.find((f) => f.name === "Desconto para Longa Permanência (10%)")!;

    expect(platformFee.amount).toBeCloseTo(58.5);
    expect(serviceFee.amount).toBeCloseTo(30);
    expect(discount.amount).toBe(-100);
    expect(result.total).toBeCloseTo(988.5);
  });

  it("returns zero fees array when no fees configured", () => {
    const service = new PricingService([]);
    const result = service.calculate(1000, 1);

    expect(result.days).toBe(1);
    expect(result.fees).toHaveLength(0);
    expect(result.total).toBe(1000);
  });
});
