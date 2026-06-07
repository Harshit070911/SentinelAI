import { ScenarioStep } from "./scenarioTemplates";

export function generateIncidentPayload(step: ScenarioStep, overrideCoords?: [number, number]) {
  const coords = overrideCoords || step.coordinates || [28.4595, 77.0266];
  
  // Map severity string to public.severity_enum
  const severityMap: Record<string, "critical" | "high" | "medium" | "low"> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low"
  };

  const severityVal = severityMap[step.severity] || "medium";

  return {
    title: step.title,
    description: step.description,
    incident_type: step.incidentType || "General Emergency",
    severity: severityVal,
    status: "pending" as const, // initially pending/unverified
    latitude: coords[0],
    longitude: coords[1],
    reported_by: "Simulated Sensor Core",
    priority_score: step.severity === "critical" ? 95 : step.severity === "high" ? 75 : 45,
    ai_summary: step.description,
    recommended_resource_type: step.recommendedResource || "POLICE",
    ai_confidence: 0.95,
    created_at: new Date().toISOString()
  };
}
