export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC';
  } catch {
    return '00:00:00 UTC';
  }
}

export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  // Haversine formula for calculating distance
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLng = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateETA(distanceKm: number): number {
  // Assume average emergency vehicle speed of 50 km/h in city traffic
  const speedKmh = 50;
  const hours = distanceKm / speedKmh;
  return Math.max(1, Math.round(hours * 60)); // minimum 1 minute
}
