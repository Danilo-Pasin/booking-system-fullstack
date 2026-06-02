export class DomainError extends Error {
  constructor(message?: string) {
    super(message ?? "Domain error");
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Validation error");
  }
}
export class PastCheckInError extends ValidationError {
  constructor() {
    super("Check-in cannot be in the past.");
  }
}
export class InvalidDateRangeError extends ValidationError {
  constructor() {
    super("Check-out must be after check-in.");
  }
}

export class NotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Not found");
  }
}
export class AccommodationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Accommodation not found: ${id}`);
  }
}
export class BookingNotFoundError extends NotFoundError {}

export class ConflictError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Conflict");
  }
}
export class AccommodationUnavailableError extends ConflictError {
  constructor() {
    super("Accommodation is not available for the selected dates.");
  }
}
export class EmailAlreadyInUseError extends ConflictError {
  constructor() {
    super("Email already in use.");
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Unauthorized");
  }
}
export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password.");
  }
}
