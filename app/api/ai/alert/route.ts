import { NextRequest, NextResponse } from "next/server";
import { generateAlert } from "@/ai/alertGenerator";
import { createServerSupabaseClient } from "@/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, incidentType, location, summary } = body;

    let type = incidentType;
    let loc = location;
    let desc = summary;

    // 1. If incidentId is supplied, lookup details from database
    if (incidentId) {
      const supabase = createServerSupabaseClient();
      const { data: incident, error } = await supabase
        .from("incidents")
        .select("incident_type, title, description, ai_summary")
        .eq("id", incidentId)
        .single();

      if (error || !incident) {
        return NextResponse.json(
          { error: `Incident not found: ${error?.message || "unknown error"}` },
          { status: 404 }
        );
      }

      type = incident.incident_type;
      loc = incident.title;
      desc = incident.ai_summary || incident.description || "";
    }

    // 2. Validate parameters
    if (!type || !loc || !desc) {
      return NextResponse.json(
        {
          error:
            "Missing parameters: Provide either 'incidentId' OR 'incidentType'/'location'/'summary'",
        },
        { status: 400 }
      );
    }

    // 3. Generate alert text using Gemini 2.5 Flash
    const alertText = await generateAlert(type, loc, desc);
    
    return NextResponse.json({ alert: alertText });
  } catch (err: any) {
    console.error("Error in /api/ai/alert:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate public safety alert" },
      { status: 500 }
    );
  }
}
