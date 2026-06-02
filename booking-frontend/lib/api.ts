const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchAccommodations() {
  const res = await fetch(`${API_URL}/accommodations`);
  return res.json();
}

export async function previewPrice(accommodationId: string, checkIn: string, checkOut: string) {
  const res = await fetch(`${API_URL}/bookings/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accommodationId, checkIn, checkOut }),
  });
  return res.json();
}

export async function createBooking(accommodationId: string, checkIn: string, checkOut: string, token: string) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ accommodationId, checkIn, checkOut }),
  });
  return res.json();
}

export async function fetchBookings(token: string) {
  const res = await fetch(`${API_URL}/bookings`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function cancelBooking(id: string, token: string) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to cancel booking");
  }
}