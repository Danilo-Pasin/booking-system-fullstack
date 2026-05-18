import bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/UserRepository";

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginUserInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password.");
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}