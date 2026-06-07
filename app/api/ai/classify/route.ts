import { NextRequest, NextResponse } from "next/server";
import { translateToEnglish } from "@/ai/translator";
import { classifyIncident } from "@/ai/classifier";
import { determineSeverity } from "@/ai/severity";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: "Missing required parameter: message" },
        { status: 400 }
      );
    }

    // Translate to English first if necessary (uses cache internally)
    const englishText = await translateToEnglish(message);

    // Run classification (uses cache, Zod validation, and structured confidence/reason extraction)
    const classification = await classifyIncident(englishText);

    // Refine severity using hybrid rules override (checks weapons, stampedes, fire spreading, etc.)
    const refinedSeverity = determineSeverity(
      classification.incidentType,
      classification.peopleAffected,
      englishText
    );

    return NextResponse.json({
      incidentType: classification.incidentType,
      severity: refinedSeverity,
      priorityScore: classification.priorityScore,
      confidence: classification.confidence,
      summary: classification.summary,
      reason: classification.reason,
      recommendedResource: classification.recommendedResource,
      peopleAffected: classification.peopleAffected,
    });
  } catch (err: any) {
    console.error("Error in /api/ai/classify:", err);
    return NextResponse.json(
      { error: err.message || "Failed to classify message" },
      { status: 500 }
    );
  }
}
