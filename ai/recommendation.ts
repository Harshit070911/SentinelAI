import { createServerSupabaseClient } from "../supabase/server";
import {
  RecommendationDetails,
  ZodRecommendationSchema,
  RECOMMENDATION_FALLBACK,
} from "./schemas";

// Helper: Haversine distance calculation in kilometers
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recommends the nearest resource of the requested type and estimates travel distance/ETA.
 * Validates the output through Zod and falls back gracefully on database or validation errors.
 */
export async function recommendResourceAndEta(
  recommendedResource: "Fire Unit" | "Ambulance" | "Police Unit" | "Security Team",
  latitude: number,
  longitude: number
): Promise<RecommendationDetails> {
  try {
    const supabase = createServerSupabaseClient();

    // Map requested AI resource type to the DB resource_type field
    // Ambulance -> MEDICAL, Fire Unit -> FIRE, Police Unit / Security Team -> POLICE
    let dbResourceType = "POLICE";
    if (recommendedResource === "Ambulance") {
      dbResourceType = "MEDICAL";
    } else if (recommendedResource === "Fire Unit") {
      dbResourceType = "FIRE";
    }

    // Fetch active resources of that type
    const { data: resources, error } = await supabase
      .from("resources")
      .select("id, name, resource_type, status, latitude, longitude")
      .eq("resource_type", dbResourceType);

    if (error || !resources || resources.length === 0) {
      console.warn("Could not query resources from DB. Using fallback recommendation ETA.", error);
      return RECOMMENDATION_FALLBACK;
    }

    // Find the closest available resource
    let closestResource = null;
    let minDistance = Infinity;

    // First check available ones, fall back to busy ones if none available
    const availableResources = resources.filter((r) => r.status === "available");
    const searchGroup = availableResources.length > 0 ? availableResources : resources;

    for (const resource of searchGroup) {
      const dist = getHaversineDistance(latitude, longitude, resource.latitude, resource.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestResource = resource;
      }
    }

    if (!closestResource) {
      return RECOMMENDATION_FALLBACK;
    }

    // Calculate ETA: Assume average dispatch speed of 40 km/h, add 2 mins dispatch overhead.
    // If the resource was busy, add an extra 10 mins queue time.
    const averageSpeedKmh = 40;
    const transitTimeMinutes = (minDistance / averageSpeedKmh) * 60;
    const dispatchDelay = 2;
    const busyDelay = closestResource.status !== "available" ? 10 : 0;
    
    const calculatedEta = Math.round(transitTimeMinutes + dispatchDelay + busyDelay);
    const finalEta = Math.max(calculatedEta, 3); // minimum 3 mins ETA

    // Confidence mapping: 0.95 if available, 0.75 if busy (due to queue delay)
    const confidence = closestResource.status === "available" ? 0.95 : 0.70;

    const recommendation: RecommendationDetails = {
      resourceType: recommendedResource,
      resourceName: closestResource.name,
      distanceKm: parseFloat(minDistance.toFixed(2)),
      etaMinutes: finalEta,
      confidence: confidence,
    };

    // Zod validation
    const validated = ZodRecommendationSchema.safeParse(recommendation);
    if (!validated.success) {
      console.warn("Zod validation failed for recommendation:", validated.error);
      return RECOMMENDATION_FALLBACK;
    }

    return validated.data;
  } catch (err) {
    console.error("Failed to recommend resource. Returning fallback. Error:", err);
    return RECOMMENDATION_FALLBACK;
  }
}
