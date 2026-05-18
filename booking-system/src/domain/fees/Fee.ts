export interface Fee {
  name: string;
  calculate(amount: number): number;
}

export class PlatformFee implements Fee {
  public readonly name = "Platform Fee";
  private readonly RATE = 0.0585; // 5.85%

  calculate(amount: number): number {
    return amount * this.RATE;
  }
}

export class CleaningFee implements Fee {
  public readonly name = "Cleaning Fee";

  constructor(private readonly fixedAmount: number) {}

  calculate(_amount: number): number {
    return this.fixedAmount;
  }
}

export class ServiceFee implements Fee {
  public readonly name = "Service Fee";

  constructor(private readonly rate: number) {}

  calculate(amount: number): number {
    return amount * this.rate;
  }
}

export class DiscountCoupon implements Fee {
  public readonly name: string;

  constructor(
    code: string,
    private readonly discountRate: number
  ) {
    this.name = `Coupon (${code})`;
  }

  calculate(amount: number): number {
    return -(amount * this.discountRate); // Negative = discount
  }
}
