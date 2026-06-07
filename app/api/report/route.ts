import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { AiService } from "@/services/ai.service";

export async function POST(req: NextRequest) {
  try {
    const { title, description, latitude, longitude } = await req.json();
    
    if (!title || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: title, latitude, longitude" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // 1. Insert incident immediately with default fields
    const { data: incident, error: insertError } = await supabase
      .from("incidents")
      .insert([
        {
          title,
          description: description || null,
          latitude,
          longitude,
          status: "pending",
          incident_type: "Telemetry Report",
          severity: "medium",
          priority_score: 50,
          ai_summary: description || "Enrichment in progress...",
          recommended_resource_type: "Security Team",
          ai_confidence: 0.5
        }
      ])
      .select()
      .single();

    if (insertError || !incident) {
      return NextResponse.json({ error: insertError?.message || "Failed to create incident" }, { status: 500 });
    }

    // 2. Log "Incident created" timeline event
    await supabase.from("incident_events").insert([
      {
        incident_id: incident.id,
        event_type: "Incident created",
        description: `Telemetry incident report created successfully. Title: "${title}".`
      }
    ]);

    // 3. Kick off AI pipeline in the background (NON-BLOCKING)
    const textToAnalyze = `Title: ${title}. Description: ${description || ""}`;
    AiService.runBackgroundAiPipeline(incident.id, textToAnalyze, latitude, longitude).catch((aiErr) => {
      console.error(`Background AI Enrichment failed for incident ${incident.id}:`, aiErr);
    });

    // 4. Return success quickly
    return NextResponse.json(incident, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
