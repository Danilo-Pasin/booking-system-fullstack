export interface Fee {
  name: string;
  calculate(amount: number, days?: number): number;
}

export class PlatformFee implements Fee {
  public readonly name = "Taxa da Plataforma";
  private readonly RATE = 0.0585; // 5.85%

  calculate(amount: number): number {
    return amount * this.RATE;
  }
}

export class CleaningFee implements Fee {
  public readonly name = "Taxa de Limpeza";

  constructor(private readonly fixedAmount: number) {}

  calculate(_amount: number): number {
    return this.fixedAmount;
  }
}

export class ServiceFee implements Fee {
  public readonly name = "Taxa de Serviço";

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
    this.name = `Cupom (${code})`;
  }

  calculate(amount: number): number {
    return -(amount * this.discountRate); // Negative = discount
  }
}

export class LongStayDiscount implements Fee {
  public readonly name = "Desconto para Longa Permanência (10%)";
  private readonly DISCOUNT_RATE = 0.10;
  private readonly MIN_DAYS = 7;

  calculate(amount: number, days?: number): number {
    if (days && days > this.MIN_DAYS) {
      return -(amount * this.DISCOUNT_RATE);
    }
    return 0;
  }
}
