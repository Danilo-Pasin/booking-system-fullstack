import bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { InvalidCredentialsError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginUserInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    return toUserResponse(user);
  }
}
