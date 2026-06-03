import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.store.values()).find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
}
