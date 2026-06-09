import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";

export class BcryptHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
