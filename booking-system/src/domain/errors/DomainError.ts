export class DomainError extends Error {
  constructor(message?: string) {
    super(message ?? "Erro de domínio");
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Erro de validação");
  }
}
export class PastCheckInError extends ValidationError {
  constructor() {
    super("O check-in não pode estar no passado.");
  }
}
export class InvalidDateRangeError extends ValidationError {
  constructor() {
    super("O check-out deve ser posterior ao check-in.");
  }
}

export class NotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Não encontrado");
  }
}
export class AccommodationNotFoundError extends NotFoundError {
  constructor() {
    super("Acomodação não encontrada");
  }
}
export class BookingNotFoundError extends NotFoundError {
  constructor() {
    super("Reserva não encontrada");
  }
}

export class ConflictError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Conflito");
  }
}
export class AccommodationUnavailableError extends ConflictError {
  constructor() {
    super("A acomodação não está disponível para as datas selecionadas.");
  }
}
export class EmailAlreadyInUseError extends ConflictError {
  constructor() {
    super("Este email já está em uso.");
  }
}
export class AlreadyHostError extends ConflictError {
  constructor() {
    super("O usuário já é um HOST.");
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Não autorizado");
  }
}
export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Email ou senha inválidos.");
  }
}

export class ForbiddenError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Acesso negado");
  }
}
export class HostOnlyError extends ForbiddenError {
  constructor() {
    super("Apenas anfitriões podem realizar esta ação.");
  }
}
export class NotOwnerError extends ForbiddenError {
  constructor() {
    super("Você não é o proprietário desta acomodação.");
  }
}

export class UploadFailedError extends DomainError {
  constructor() {
    super("Falha no upload do arquivo.");
  }
}

export class BookingNotPendingError extends ValidationError {
  constructor(currentStatus: string) {
    super(`A reserva não pode ser processada pois está ${currentStatus}. Apenas reservas PENDING podem ser atualizadas.`);
  }
}
export class BookingAlreadyApprovedError extends ConflictError {
  constructor() {
    super("Esta acomodação já possui uma reserva APROVADA para as datas solicitadas.");
  }
}
