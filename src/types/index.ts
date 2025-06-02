export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number;
  time: number;
  fare: number;
}

export interface TravelState {
  transport: {
    selected: string[];
    time: number;
  };
  location: {
    current: {
      lat: number;
      lng: number;
      address: string;
    };
    selected: Location | null;
  };
  route: {
    info: RouteInfo | null;
    line: any | null;
  };
}

export interface Point {
  lat: number;
  lng: number;
}

export type TransportType = 'car' | 'public'; 