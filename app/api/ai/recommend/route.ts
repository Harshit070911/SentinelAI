import { NextRequest, NextResponse } from "next/server";
import { recommendResourceAndEta } from "@/ai/recommendation";
import { createServerSupabaseClient } from "@/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, recommendedResource, latitude, longitude } = body;

    let targetResource = recommendedResource;
    let lat = latitude;
    let lng = longitude;

    // 1. If incidentId is provided, query details from the database
    if (incidentId) {
      const supabase = createServerSupabaseClient();
      const { data: incident, error } = await supabase
        .from("incidents")
        .select("latitude, longitude, recommended_resource_type, incident_type")
        .eq("id", incidentId)
        .single();

      if (error || !incident) {
        return NextResponse.json(
          { error: `Incident not found: ${error?.message || "unknown error"}` },
          { status: 404 }
        );
      }

      lat = incident.latitude;
      lng = incident.longitude;
      
      if (incident.recommended_resource_type) {
        targetResource = incident.recommended_resource_type;
      } else {
        // Fallback mapping
        const type = incident.incident_type;
        if (type === "Fire") targetResource = "Fire Unit";
        else if (type === "Medical") targetResource = "Ambulance";
        else if (type === "Violence") targetResource = "Police Unit";
        else targetResource = "Security Team";
      }
    }

    // 2. Validate input parameters
    if (!targetResource || lat === undefined || lng === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing parameters: Provide either 'incidentId' OR 'recommendedResource'/'latitude'/'longitude'",
        },
        { status: 400 }
      );
    }

    // Normalize recommended resource string
    let resolvedResource = targetResource;
    if (resolvedResource === "Fire") resolvedResource = "Fire Unit";
    if (resolvedResource === "Medical") resolvedResource = "Ambulance";
    if (resolvedResource === "Violence") resolvedResource = "Police Unit";
    if (resolvedResource === "Crowd") resolvedResource = "Security Team";

    // Validate type boundaries
    const validResources = ["Fire Unit", "Ambulance", "Police Unit", "Security Team"];
    if (!validResources.includes(resolvedResource)) {
      resolvedResource = "Security Team"; // Default fallback
    }

    // 3. Fetch recommendation & ETA
    const recommendation = await recommendResourceAndEta(
      resolvedResource as any,
      lat,
      lng
    );

    return NextResponse.json(recommendation);
  } catch (err: any) {
    console.error("Error in /api/ai/recommend:", err);
    return NextResponse.json(
      { error: err.message || "Failed to recommend resource" },
      { status: 500 }
    );
  }
}
