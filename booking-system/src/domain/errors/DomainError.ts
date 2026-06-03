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
  constructor() {
    super("Accommodation not found");
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
export class AlreadyHostError extends ConflictError {
  constructor() {
    super("User is already a HOST.");
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

export class ForbiddenError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Forbidden");
  }
}
export class HostOnlyError extends ForbiddenError {
  constructor() {
    super("Only hosts can perform this action.");
  }
}
export class NotOwnerError extends ForbiddenError {
  constructor() {
    super("You do not own this accommodation.");
  }
}

export class UploadFailedError extends DomainError {
  constructor() {
    super("File upload failed.");
  }
}

export class BookingNotPendingError extends ValidationError {
  constructor(currentStatus: string) {
    super(`Booking cannot be processed because it is ${currentStatus}. Only PENDING bookings can be updated.`);
  }
}
export class BookingAlreadyApprovedError extends ConflictError {
  constructor() {
    super("This accommodation already has an APPROVED booking for the requested dates.");
  }
}
