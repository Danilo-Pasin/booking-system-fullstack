export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "GUEST" | "HOST";
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}
