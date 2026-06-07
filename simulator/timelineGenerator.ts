export interface SimulationMilestone {
  timeOffset: number; // T+ seconds relative to incident start
  label: string;
  description: string;
  stage: "created" | "classified" | "dispatched" | "alert" | "resolved";
}

export function generateSimulationMilestones(incidentType: string, resourceName: string): SimulationMilestone[] {
  return [
    {
      timeOffset: 0,
      label: "T+0 Incident Created",
      description: `Simulated report: ${incidentType} emergency logged. Telemetry sensor lines established.`,
      stage: "created"
    },
    {
      timeOffset: 5,
      label: "T+5 AI Classification",
      description: `Gemini 2.5 Flash analysis completed. Classification verified, severity parsed.`,
      stage: "classified"
    },
    {
      timeOffset: 10,
      label: "T+10 Resource Assigned",
      description: `${resourceName} assigned to incident. Dispatched status set in database.`,
      stage: "dispatched"
    },
    {
      timeOffset: 20,
      label: "T+20 Alert Broadcast",
      description: `Emergency broadcast alert successfully sent to public alert boards.`,
      stage: "alert"
    },
    {
      timeOffset: 60,
      label: "T+60 Incident Resolved",
      description: `Operational units report all clear. Incident closed, resource released.`,
      stage: "resolved"
    }
  ];
}
