import { describe, it, expect } from "vitest";
import {
  DomainError,
  ValidationError,
  PastCheckInError,
  InvalidDateRangeError,
  NotFoundError,
  BookingNotFoundError,
  ConflictError,
  EmailAlreadyInUseError,
  UnauthorizedError,
  InvalidCredentialsError,
  ForbiddenError,
  HostOnlyError,
  NotOwnerError,
  UploadFailedError,
} from "../domain/errors/DomainError";

const PT_BR = {
  HostOnlyError: "Apenas anfitriões podem realizar esta ação.",
  NotOwnerError: "Você não é o proprietário desta acomodação.",
  ValidationError: "Erro de validação",
  PastCheckInError: "O check-in não pode estar no passado.",
  InvalidDateRangeError: "O check-out deve ser posterior ao check-in.",
  NotFoundError: "Não encontrado",
  BookingNotFoundError: "Reserva não encontrada",
  ConflictError: "Conflito",
  EmailAlreadyInUseError: "Este email já está em uso.",
  UnauthorizedError: "Não autorizado",
  InvalidCredentialsError: "Email ou senha inválidos.",
  ForbiddenError: "Acesso negado",
  UploadFailedError: "Falha no upload do arquivo.",
};

describe("HostOnlyError", () => {
  it("has correct message", () => {
    const err = new HostOnlyError();
    expect(err.message).toBe(PT_BR.HostOnlyError);
    expect(err.name).toBe("HostOnlyError");
  });

  it("is instance of ForbiddenError and DomainError", () => {
    const err = new HostOnlyError();
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("NotOwnerError", () => {
  it("has correct message", () => {
    const err = new NotOwnerError();
    expect(err.message).toBe(PT_BR.NotOwnerError);
    expect(err.name).toBe("NotOwnerError");
  });

  it("is instance of ForbiddenError and DomainError", () => {
    const err = new NotOwnerError();
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("ValidationError", () => {
  it("has default message", () => {
    const err = new ValidationError();
    expect(err.message).toBe(PT_BR.ValidationError);
    expect(err.name).toBe("ValidationError");
  });

  it("accepts custom message", () => {
    const err = new ValidationError("Custom validation error");
    expect(err.message).toBe("Custom validation error");
  });

  it("is instance of DomainError", () => {
    const err = new ValidationError();
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("PastCheckInError", () => {
  it("has correct message", () => {
    const err = new PastCheckInError();
    expect(err.message).toBe(PT_BR.PastCheckInError);
    expect(err.name).toBe("PastCheckInError");
  });

  it("is instance of ValidationError and DomainError", () => {
    const err = new PastCheckInError();
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("InvalidDateRangeError", () => {
  it("has correct message", () => {
    const err = new InvalidDateRangeError();
    expect(err.message).toBe(PT_BR.InvalidDateRangeError);
    expect(err.name).toBe("InvalidDateRangeError");
  });

  it("is instance of ValidationError and DomainError", () => {
    const err = new InvalidDateRangeError();
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("NotFoundError", () => {
  it("has default message", () => {
    const err = new NotFoundError();
    expect(err.message).toBe(PT_BR.NotFoundError);
    expect(err.name).toBe("NotFoundError");
  });

  it("accepts custom message", () => {
    const err = new NotFoundError("Custom not found");
    expect(err.message).toBe("Custom not found");
  });

  it("is instance of DomainError", () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("BookingNotFoundError", () => {
  it("has default message", () => {
    const err = new BookingNotFoundError();
    expect(err.message).toBe(PT_BR.BookingNotFoundError);
    expect(err.name).toBe("BookingNotFoundError");
  });

  it("is instance of NotFoundError and DomainError", () => {
    const err = new BookingNotFoundError();
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("ConflictError", () => {
  it("has default message", () => {
    const err = new ConflictError();
    expect(err.message).toBe(PT_BR.ConflictError);
    expect(err.name).toBe("ConflictError");
  });

  it("is instance of DomainError", () => {
    const err = new ConflictError();
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("EmailAlreadyInUseError", () => {
  it("has correct message", () => {
    const err = new EmailAlreadyInUseError();
    expect(err.message).toBe(PT_BR.EmailAlreadyInUseError);
    expect(err.name).toBe("EmailAlreadyInUseError");
  });

  it("is instance of ConflictError and DomainError", () => {
    const err = new EmailAlreadyInUseError();
    expect(err).toBeInstanceOf(ConflictError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("UnauthorizedError", () => {
  it("has default message", () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe(PT_BR.UnauthorizedError);
    expect(err.name).toBe("UnauthorizedError");
  });

  it("is instance of DomainError", () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("InvalidCredentialsError", () => {
  it("has correct message", () => {
    const err = new InvalidCredentialsError();
    expect(err.message).toBe(PT_BR.InvalidCredentialsError);
    expect(err.name).toBe("InvalidCredentialsError");
  });

  it("is instance of UnauthorizedError and DomainError", () => {
    const err = new InvalidCredentialsError();
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("ForbiddenError", () => {
  it("has default message", () => {
    const err = new ForbiddenError();
    expect(err.message).toBe(PT_BR.ForbiddenError);
    expect(err.name).toBe("ForbiddenError");
  });

  it("is instance of DomainError", () => {
    const err = new ForbiddenError();
    expect(err).toBeInstanceOf(DomainError);
  });
});

describe("UploadFailedError", () => {
  it("has correct message", () => {
    const err = new UploadFailedError();
    expect(err.message).toBe(PT_BR.UploadFailedError);
    expect(err.name).toBe("UploadFailedError");
  });

  it("is instance of DomainError", () => {
    const err = new UploadFailedError();
    expect(err).toBeInstanceOf(DomainError);
  });
});
