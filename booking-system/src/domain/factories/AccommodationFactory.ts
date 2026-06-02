import { Accommodation } from "../entities/Accommodation";
import { House } from "../entities/House";
import { Apartment } from "../entities/Apartment";
import { SharedRoom } from "../entities/SharedRoom";

type AccommodationData = {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
};

export class AccommodationFactory {
  create(data: AccommodationData): Accommodation {
    switch (data.type) {
      case "house":
        return new House(data.id, data.name, data.pricePerNight);
      case "apartment":
        return new Apartment(data.id, data.name, data.pricePerNight);
      case "shared_room":
        return new SharedRoom(data.id, data.name, data.pricePerNight);
      default:
        throw new Error(`Unknown accommodation type: ${data.type}`);
    }
  }
}
