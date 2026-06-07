/**
 * Builds the operational context window for the copilot by fetching
 * live data from Supabase and formatting it into a compact prompt payload.
 */

import { createServerSupabaseClient } from "../supabase/server";
import {
  CONTEXT_HEADER,
  INCIDENT_CONTEXT_HEADER,
  RESOURCE_CONTEXT_HEADER,
  ALERT_CONTEXT_HEADER,
  EVENT_CONTEXT_HEADER,
} from "./prompts";

const MAX_INCIDENTS = 15;
const MAX_RESOURCES = 15;
const MAX_ALERTS = 10;
const MAX_EVENTS = 10;

export interface OperationalContext {
  contextString: string;
  incidentCount: number;
  resourceCount: number;
  alertCount: number;
  eventCount: number;
}

/**
 * Fetches all relevant operational data from the database and compresses
 * it into a single context string for Gemini consumption.
 */
export async function buildOperationalContext(): Promise<OperationalContext> {
  const supabase = createServerSupabaseClient();

  // Parallel fetch all data sources
  const [incidentsRes, resourcesRes, alertsRes, eventsRes] = await Promise.all([
    supabase
      .from("incidents")
      .select("id, title, description, incident_type, severity, status, latitude, longitude, priority_score, ai_summary, recommended_resource_type, ai_confidence, assigned_resource, created_at")
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(MAX_INCIDENTS),
    supabase
      .from("resources")
      .select("id, name, resource_type, status, latitude, longitude, availability")
      .order("status", { ascending: true })
      .limit(MAX_RESOURCES),
    supabase
      .from("alerts")
      .select("id, title, message, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_ALERTS),
    supabase
      .from("incident_events")
      .select("id, incident_id, event_type, description, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_EVENTS),
  ]);

  const incidents = incidentsRes.data || [];
  const resources = resourcesRes.data || [];
  const alerts = alertsRes.data || [];
  const events = eventsRes.data || [];

  // Format incidents
  const incidentLines = incidents.map((i) => {
    const parts = [
      `ID: ${i.id}`,
      `Type: ${i.incident_type}`,
      `Severity: ${i.severity}`,
      `Status: ${i.status}`,
      `Location: ${i.title}`,
      `Coords: [${i.latitude}, ${i.longitude}]`,
    ];
    if (i.priority_score) parts.push(`Priority Score: ${i.priority_score}`);
    if (i.ai_summary) parts.push(`AI Summary: ${i.ai_summary}`);
    if (i.recommended_resource_type) parts.push(`Recommended: ${i.recommended_resource_type}`);
    if (i.ai_confidence) parts.push(`AI Confidence: ${(i.ai_confidence * 100).toFixed(0)}%`);
    if (i.assigned_resource) parts.push(`Assigned Resource: ${i.assigned_resource}`);
    return `- ${parts.join(" | ")}`;
  });

  // Format resources
  const resourceLines = resources.map((r) => {
    return `- ID: ${r.id} | Name: ${r.name} | Type: ${r.resource_type} | Status: ${r.status} | Available: ${r.availability} | Coords: [${r.latitude}, ${r.longitude}]`;
  });

  // Format alerts
  const alertLines = alerts.map((a) => {
    return `- ID: ${a.id} | Title: ${a.title} | Severity: ${a.severity} | Message: ${(a.message || "").slice(0, 120)}`;
  });

  // Format events
  const eventLines = events.map((e) => {
    return `- Event: ${e.event_type} | Incident: ${e.incident_id} | ${e.description || ""} | ${e.created_at}`;
  });

  // Assemble the full context
  let contextString = CONTEXT_HEADER;

  contextString += INCIDENT_CONTEXT_HEADER;
  contextString += incidents.length > 0
    ? `\n${incidentLines.join("\n")}`
    : "\nNo active incidents currently reported.";

  contextString += RESOURCE_CONTEXT_HEADER;
  contextString += resources.length > 0
    ? `\n${resourceLines.join("\n")}`
    : "\nNo resources registered in the system.";

  contextString += ALERT_CONTEXT_HEADER;
  contextString += alerts.length > 0
    ? `\n${alertLines.join("\n")}`
    : "\nNo active alerts.";

  contextString += EVENT_CONTEXT_HEADER;
  contextString += events.length > 0
    ? `\n${eventLines.join("\n")}`
    : "\nNo recent timeline events.";

  return {
    contextString,
    incidentCount: incidents.length,
    resourceCount: resources.length,
    alertCount: alerts.length,
    eventCount: events.length,
  };
}
