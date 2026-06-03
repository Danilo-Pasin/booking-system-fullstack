import type { Accommodation } from "../entities/Accommodation";
import type { Image } from "../entities/Image";
import { House } from "../entities/House";
import { Apartment } from "../entities/Apartment";
import { SharedRoom } from "../entities/SharedRoom";
import { ValidationError } from "../errors/DomainError";

type AccommodationData = {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  description?: string | null;
  imageUrl?: string | null;
  images?: Image[];
  ownerId: string;
};

export class AccommodationFactory {
  create(data: AccommodationData): Accommodation {
    const images = data.images ?? [];
    const imageUrl = data.imageUrl ?? undefined;
    switch (data.type) {
      case "house":
        return new House(data.id, data.name, data.pricePerNight, "house", data.description ?? undefined, imageUrl, data.ownerId, images);
      case "apartment":
        return new Apartment(data.id, data.name, data.pricePerNight, "apartment", data.description ?? undefined, imageUrl, data.ownerId, images);
      case "shared_room":
        return new SharedRoom(data.id, data.name, data.pricePerNight, "shared_room", data.description ?? undefined, imageUrl, data.ownerId, images);
      default:
        throw new ValidationError("Invalid accommodation type: " + data.type);
    }
  }
}
