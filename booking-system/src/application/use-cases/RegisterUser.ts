import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { EmailAlreadyInUseError, ValidationError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: "GUEST" | "HOST";
}

export class RegisterUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const role = input.role ?? "GUEST";
    if (role !== "GUEST" && role !== "HOST") {
      throw new ValidationError("Role must be GUEST or HOST");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    await this.userRepository.save(user);

    return toUserResponse(user);
  }
}
