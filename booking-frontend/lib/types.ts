export type ImageItem = {
  id: string;
  url: string;
  order: number;
  isPrimary?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "GUEST" | "HOST";
  avatarUrl?: string;
  bio?: string;
  images?: ImageItem[];
  createdAt?: string;
};

export type UserPublic = User & {
  accommodationCount?: number;
};

export type Accommodation = {
  id: string;
  name: string;
  type: "house" | "apartment" | "shared_room";
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: ImageItem[];
  ownerId?: string;
};

export type FeeItem = {
  name: string;
  amount: number;
};

export type PricePreview = {
  days: number;
  base: number;
  fees: FeeItem[];
  total: number;
};

export type Booking = {
  id: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  totalPrice: number;
  status?: string;
  createdAt: string;
  userId: string;
  userName?: string;
  accommodation: Accommodation;
};

export type HostBooking = {
  id: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail?: string;
  accommodation: Accommodation;
};

export type DashboardData = {
  accommodationsCount: number;
  bookingsCount: number;
  estimatedRevenue: number;
  pendingBookings?: Booking[];
};

export type CreateAccommodationData = {
  name: string;
  type: string;
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
};

export type UpdateAccommodationData = {
  name?: string;
  pricePerNight?: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
};

export type UpdateProfileData = {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  images?: string[];
};
