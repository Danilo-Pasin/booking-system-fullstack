import { Fee } from "../../domain/fees/Fee";

export interface PricingBreakdown {
  base: number;
  fees: { name: string; amount: number }[];
  total: number;
}

export class PricingService {
  constructor(private readonly fees: Fee[]) {}

  calculate(basePrice: number, days?: number): PricingBreakdown {
    const appliedFees = this.fees.map((fee) => ({
      name: fee.name,
      amount: fee.calculate(basePrice, days),
    }));

    const total =
      basePrice + appliedFees.reduce((sum, f) => sum + f.amount, 0);

    return { base: basePrice, fees: appliedFees, total };
  }
}
