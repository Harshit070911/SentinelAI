import { supabase } from "../supabase/client";
import { MapService } from "../services/map.service";

export interface DispatchedUnitState {
  resourceId: string;
  incidentId: string;
  startCoords: [number, number];
  targetCoords: [number, number];
  startTime: number; // T+ seconds relative to simulation start
  duration: number; // total travel duration in seconds
  completed: boolean;
}

export const Dispatcher = {
  /**
   * Finds the closest available resource of a specific type.
   */
  async findClosestResource(
    coords: [number, number],
    requestedType: "FIRE" | "MEDICAL" | "POLICE" | "SECURITY"
  ) {
    // Fetch all resources from Supabase
    const { data: dbResources, error } = await supabase
      .from("resources")
      .select("*");

    if (error || !dbResources) {
      console.error("Dispatcher failed to fetch resources:", error);
      return null;
    }

    // Map requested type to DB types
    let dbType = requestedType.toUpperCase();
    if (dbType === "SECURITY") {
      dbType = "POLICE"; // Fallback to police unit if security is requested
    }

    // Filter available resources matching DB type
    const available = dbResources.filter(
      (res) =>
        res.resource_type.toUpperCase() === dbType &&
        (res.status === "available" || res.availability === true)
    );

    if (available.length === 0) {
      // If no available resource, pick any of that type (even if busy)
      const allOfType = dbResources.filter(
        (res) => res.resource_type.toUpperCase() === dbType
      );
      if (allOfType.length === 0) return null;
      // Return closest one
      return this.selectClosest(coords, allOfType);
    }

    return this.selectClosest(coords, available);
  },

  selectClosest(targetCoords: [number, number], resources: any[]) {
    let closest = resources[0];
    let minDistance = Infinity;

    for (const res of resources) {
      const dist = MapService.calculateDistance(targetCoords, [res.latitude, res.longitude]);
      if (dist < minDistance) {
        minDistance = dist;
        closest = res;
      }
    }

    return closest;
  },

  /**
   * Smoothly interpolates coordinates between two positions.
   */
  interpolateCoords(
    start: [number, number],
    end: [number, number],
    progress: number // float between 0 and 1
  ): [number, number] {
    const p = Math.max(0, Math.min(1, progress));
    return [
      start[0] + (end[0] - start[0]) * p,
      start[1] + (end[1] - start[1]) * p
    ];
  }
};
