import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/UserRepository";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Email already in use.");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = {
      id:        randomUUID(),
      name:      input.name,
      email:     input.email,
      password:  hashedPassword,
      createdAt: new Date(),
    };

    await this.userRepository.save(user);

    return { id: user.id, name: user.name, email: user.email };
  }
}