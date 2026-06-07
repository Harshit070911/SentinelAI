import { Resource } from "../types";

export const MapService = {
  /**
   * Calculates the distance between two coordinates in kilometers using the Haversine formula.
   */
  calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[0] * Math.PI) / 180) *
        Math.cos((coord2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Estimates the ETA in minutes for a given distance, adjusted for vehicle speed by type.
   */
  estimateETA(distanceKm: number, resourceType?: string): number {
    let speedKmh = 50; // default average speed in km/h

    // Adjust speed based on resource type
    const type = (resourceType || "").toUpperCase();
    if (type.includes("MEDICAL") || type.includes("AMBULANCE")) {
      speedKmh = 55;
    } else if (type.includes("FIRE")) {
      speedKmh = 45;
    } else if (type.includes("POLICE")) {
      speedKmh = 52;
    } else if (type.includes("SECURITY")) {
      speedKmh = 48;
    }

    const hours = distanceKm / speedKmh;
    return Math.max(1, Math.round(hours * 60)); // minimum 1 minute
  },

  /**
   * Calculates the distance and ETA for all resources relative to an incident, sorting by proximity.
   */
  getNearbyResources(
    incidentCoords: [number, number],
    resources: Resource[]
  ): (Resource & { distance: number; eta: number })[] {
    return resources
      .map((res) => {
        const distance = this.calculateDistance(incidentCoords, res.coordinates);
        const eta = this.estimateETA(distance, res.type);
        return {
          ...res,
          distance,
          eta,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }
};
