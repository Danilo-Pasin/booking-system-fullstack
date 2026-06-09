import { UserRepository } from "../../domain/repositories/UserRepository";
import { InvalidCredentialsError } from "../../domain/errors/DomainError";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { toUserResponse } from "./UserResponse";

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.passwordHasher.compare(input.password, user.password);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    return toUserResponse(user);
  }
}
