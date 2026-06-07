/**
 * Copilot tool functions that query live Supabase data
 * and execute AI operations on behalf of the operator.
 */

import { createServerSupabaseClient } from "../supabase/server";
import { generateAlert } from "../ai/alertGenerator";
import { predictThreatEscalation } from "../ai/prediction";

export interface ToolResult {
  toolName: string;
  data: any;
  summary: string;
}

/**
 * Returns all critical incidents that are not resolved.
 */
export async function getCriticalIncidents(): Promise<ToolResult> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("severity", "critical")
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      toolName: "getCriticalIncidents",
      data: [],
      summary: `Failed to fetch critical incidents: ${error.message}`,
    };
  }

  return {
    toolName: "getCriticalIncidents",
    data: data || [],
    summary: `Found ${(data || []).length} active critical incidents.`,
  };
}

/**
 * Returns all available (non-busy, non-offline) resources.
 */
export async function getAvailableResources(): Promise<ToolResult> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "available");

  if (error) {
    return {
      toolName: "getAvailableResources",
      data: [],
      summary: `Failed to fetch available resources: ${error.message}`,
    };
  }

  return {
    toolName: "getAvailableResources",
    data: data || [],
    summary: `Found ${(data || []).length} available response units.`,
  };
}

/**
 * Returns a summary of all unresolved incidents.
 */
export async function getIncidentSummary(): Promise<ToolResult> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      toolName: "getIncidentSummary",
      data: [],
      summary: `Failed to fetch incident summary: ${error.message}`,
    };
  }

  const critical = (data || []).filter((i) => i.severity === "critical").length;
  const high = (data || []).filter((i) => i.severity === "high").length;
  const medium = (data || []).filter((i) => i.severity === "medium").length;
  const low = (data || []).filter((i) => i.severity === "low").length;

  return {
    toolName: "getIncidentSummary",
    data: data || [],
    summary: `Active incidents: ${(data || []).length} total (${critical} critical, ${high} high, ${medium} medium, ${low} low).`,
  };
}

/**
 * Generates an AI-powered public safety alert based on current incidents.
 */
export async function generateAlertTool(): Promise<ToolResult> {
  const supabase = createServerSupabaseClient();
  const { data: incidents } = await supabase
    .from("incidents")
    .select("*")
    .neq("status", "resolved")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!incidents || incidents.length === 0) {
    return {
      toolName: "generateAlert",
      data: { alert: "No active incidents to generate alerts for." },
      summary: "No active incidents found.",
    };
  }

  // Use the most critical incident
  const target = incidents.sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  })[0];

  const alertText = await generateAlert(
    target.incident_type,
    target.title,
    target.description || target.ai_summary || "Emergency incident in progress."
  );

  return {
    toolName: "generateAlert",
    data: { alert: alertText, basedOn: target.id },
    summary: `Generated public alert based on incident ${target.id} (${target.incident_type}).`,
  };
}

/**
 * Returns the most recent timeline events from the incident_events table.
 */
export async function getTimelineEvents(): Promise<ToolResult> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incident_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    return {
      toolName: "getTimelineEvents",
      data: [],
      summary: `Failed to fetch timeline events: ${error.message}`,
    };
  }

  return {
    toolName: "getTimelineEvents",
    data: data || [],
    summary: `Fetched ${(data || []).length} recent timeline events.`,
  };
}

/**
 * Runs the AI threat prediction engine to estimate overcrowding/escalation risk.
 */
export async function predictRisk(): Promise<ToolResult> {
  const prediction = await predictThreatEscalation();

  return {
    toolName: "predictRisk",
    data: prediction,
    summary: `Risk level: ${prediction.riskLevel}, Overcrowding probability: ${(prediction.overcrowdingProbability * 100).toFixed(0)}%.`,
  };
}

/**
 * Resolves a tool name string to its corresponding function.
 */
export function resolveToolByIntent(query: string): (() => Promise<ToolResult>) | null {
  const q = query.toLowerCase();

  if (q.includes("critical") && q.includes("incident")) return getCriticalIncidents;
  if (q.includes("available") && (q.includes("resource") || q.includes("unit"))) return getAvailableResources;
  if (q.includes("ambulance") || q.includes("nearest") || q.includes("medic")) return getAvailableResources;
  if (q.includes("summarize") || q.includes("summary") || q.includes("active emergenc")) return getIncidentSummary;
  if (q.includes("unresolved") || q.includes("pending")) return getIncidentSummary;
  if (q.includes("generate") && q.includes("alert")) return generateAlertTool;
  if (q.includes("alert") && q.includes("broadcast")) return generateAlertTool;
  if (q.includes("timeline") || q.includes("event") || q.includes("latest event")) return getTimelineEvents;
  if (q.includes("predict") || q.includes("overcrowding") || q.includes("risk") || q.includes("escalation")) return predictRisk;
  if (q.includes("dispatched") && q.includes("resource")) return getAvailableResources;
  if (q.includes("show") && q.includes("resource")) return getAvailableResources;

  return null;
}
