import { createServerSupabaseClient } from "../supabase/server";
import { callGeminiWithRetry } from "./gemini";
import {
  PredictionSchema,
  RiskPrediction,
  ZodPredictionSchema,
  PREDICTION_FALLBACK,
} from "./schemas";

/**
 * Predicts overcrowding probability, stampede risks, and escalation risk levels
 * based on active incidents, resource availability, and live crowd density metrics.
 */
export async function predictThreatEscalation(
  crowdDensityData?: any
): Promise<RiskPrediction> {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Fetch current incidents
    const { data: incidents, error: incError } = await supabase
      .from("incidents")
      .select("incident_type, severity, status, title")
      .neq("status", "resolved");

    // 2. Fetch resource status
    const { data: resources, error: resError } = await supabase
      .from("resources")
      .select("resource_type, status");

    // Format active incidents list
    const activeIncidentsStr =
      incidents && incidents.length > 0
        ? incidents
            .map(
              (i) =>
                `- Type: ${i.incident_type}, Severity: ${i.severity}, Status: ${i.status}, Location: ${i.title}`
            )
            .join("\n")
        : "No active incidents currently reported.";

    // Format resource statuses
    const resourceStatusStr =
      resources && resources.length > 0
        ? resources
            .map((r) => `- Type: ${r.resource_type}, Status: ${r.status}`)
            .join("\n")
        : "No registered dispatch units in the database.";

    // Format crowd sensor payload
    const crowdStr = crowdDensityData
      ? typeof crowdDensityData === "object"
        ? JSON.stringify(crowdDensityData, null, 2)
        : String(crowdDensityData)
      : "Crowd density levels are reported normal across all facility sectors.";

    const prompt = `You are a hazard prediction engine for an emergency operations center.
Review the following active dashboard telemetry and forecast risk metrics:

Active Emergency Incidents:
${activeIncidentsStr}

Emergency Response Resources:
${resourceStatusStr}

Live Crowd Sensor Metrics:
${crowdStr}

Please estimate:
1. overcrowdingProbability: Probability (0.0 to 1.0) of imminent overcrowding or crowd stampede.
2. riskLevel: The general escalation risk level ("low", "medium", "high", "critical").
3. recommendedAction: A clear, operational directive to the operations commander (e.g. "Deploy security team to Sector B", "Initiate partial evacuation of Gate 5").`;

    const responseText = await callGeminiWithRetry(async (client) => {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: PredictionSchema,
        },
      });
      return response.text?.trim() || "";
    });

    if (!responseText) {
      throw new Error("Empty response received from Gemini prediction engine.");
    }

    const parsed = JSON.parse(responseText);

    // Validate with Zod
    const validated = ZodPredictionSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn(
        "Zod validation failed for threat prediction response. Returning fallback. Error details:",
        validated.error,
        "Raw response text:",
        responseText
      );
      return PREDICTION_FALLBACK;
    }

    return validated.data;
  } catch (error) {
    console.error("Threat prediction engine execution failed. Returning safe defaults. Error:", error);
    return PREDICTION_FALLBACK;
  }
}
