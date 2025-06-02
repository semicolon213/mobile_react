declare namespace Tmapv2 {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    setCenter(latLng: LatLng): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  class Circle {
    constructor(options: CircleOptions);
    setMap(map: Map | null): void;
    getCenter(): LatLng;
    getRadius(): number;
  }

  class Polygon {
    constructor(options: PolygonOptions);
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    setMap(map: Map | null): void;
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Size {
    constructor(width: number, height: number);
  }

  namespace Projection {
    function convertEPSG3857ToWGS84GEO(point: Point): LatLng;
  }

  interface MapOptions {
    center: LatLng;
    width: string;
    height: string;
    zoom: number;
    zoomControl: boolean;
    scrollwheel: boolean;
    mapType?: string;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map;
    label?: string;
    icon?: string;
    iconSize?: Size;
  }

  interface PolylineOptions {
    path: LatLng[];
    strokeColor: string;
    strokeWeight: number;
    map: Map;
    strokeOpacity?: number;
    strokeStyle?: string;
  }

  interface CircleOptions {
    center: LatLng;
    radius: number;
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    fillColor: string;
    fillOpacity: number;
    map: Map;
  }

  interface PolygonOptions {
    paths: LatLng[];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    fillColor: string;
    fillOpacity: number;
    map: Map;
  }

  interface InfoWindowOptions {
    position: LatLng;
    content: string;
    type: number;
    map: Map;
    offset: Point;
  }
}

interface Window {
  Tmapv2: typeof Tmapv2;
} 