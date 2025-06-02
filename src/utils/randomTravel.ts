import { Location, Point } from '../types';

export function filterLocationsInDonut(
  locations: Location[],
  center: { lat: number; lng: number },
  time: number,
  transport: 'car' | 'public'
) {
  const latConv = 111320;
  const lngConv = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const speedTable = { car: 60000, public: 45000 };
  const reductionTable = { car: 0.7, public: 0.5 };
  const speed = speedTable[transport] || 0;
  const avgSpeedMpm = speed / 60;
  let outerRadius = avgSpeedMpm * time;
  const reduction = reductionTable[transport] || 1;
  outerRadius = outerRadius * reduction;
  const innerRadius = outerRadius * 0.72;
  return locations.filter(({ lat, lng }) => {
    const dLat = (lat - center.lat) * latConv;
    const dLng = (lng - center.lng) * lngConv;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist >= innerRadius && dist <= outerRadius;
  });
}

export function pickRandomLocation(locations: Location[]): Location | null {
  if (!locations.length) return null;
  const randomIdx = Math.floor(Math.random() * locations.length);
  return locations[randomIdx];
} 