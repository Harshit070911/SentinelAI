import { Incident, Resource, Alert, IncidentEvent } from "../types";

export function mapDbIncidentToUi(dbInc: any): Incident {
  let uiStatus: Incident["status"] = "Unverified";
  if (dbInc.status === "dispatched") {
    // Check if the incident type or priority corresponds to "On Scene" or "Dispatching"
    // In our UI, mock INC-8491 was "On Scene", INC-8492 was "Dispatching"
    // We can map dispatched -> On Scene if there are active resources assigned, or default
    uiStatus = dbInc.assigned_resource ? "On Scene" : "Dispatching";
  } else if (dbInc.status === "resolved") {
    uiStatus = "Resolved";
  } else if (dbInc.status === "pending") {
    uiStatus = "Unverified";
  }

  let uiPriority: Incident["priority"] = "MEDIUM";
  const sev = String(dbInc.severity).toUpperCase();
  if (sev === "CRITICAL" || sev === "HIGH" || sev === "MEDIUM" || sev === "LOW") {
    uiPriority = sev as Incident["priority"];
  }

  return {
    id: dbInc.id || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    type: dbInc.incident_type,
    priority: uiPriority,
    status: uiStatus,
    location: dbInc.title,
    coordinates: [
      dbInc.latitude !== null && dbInc.latitude !== undefined ? Number(dbInc.latitude) : NaN,
      dbInc.longitude !== null && dbInc.longitude !== undefined ? Number(dbInc.longitude) : NaN
    ],
    description: dbInc.description || "",
    timestamp: dbInc.created_at || new Date().toISOString(),
    assignedResources: dbInc.assigned_resource ? [dbInc.assigned_resource] : [],
    priorityScore: dbInc.priority_score ?? undefined,
    aiSummary: dbInc.ai_summary ?? undefined,
    recommendedResourceType: dbInc.recommended_resource_type ?? undefined,
    aiConfidence: dbInc.ai_confidence ?? undefined,
    assignedAt: dbInc.assigned_at ?? undefined,
    resolvedAt: dbInc.resolved_at ?? undefined
  };
}

export function mapUiIncidentToDb(inc: Partial<Incident>) {
  const dbUpdates: any = {};
  if (inc.type !== undefined) dbUpdates.incident_type = inc.type;
  if (inc.location !== undefined) dbUpdates.title = inc.location;
  if (inc.coordinates !== undefined) {
    dbUpdates.latitude = inc.coordinates[0];
    dbUpdates.longitude = inc.coordinates[1];
  }
  if (inc.description !== undefined) dbUpdates.description = inc.description;
  if (inc.priority !== undefined) {
    dbUpdates.severity = inc.priority.toLowerCase();
  }
  if (inc.status !== undefined) {
    if (inc.status === "Unverified") dbUpdates.status = "pending";
    else if (inc.status === "Dispatching" || inc.status === "On Scene") dbUpdates.status = "dispatched";
    else if (inc.status === "Resolved") dbUpdates.status = "resolved";
  }
  if (inc.assignedResources !== undefined) {
    dbUpdates.assigned_resource = inc.assignedResources[0] || null;
  }
  if (inc.priorityScore !== undefined) {
    dbUpdates.priority_score = inc.priorityScore;
  }
  if (inc.aiSummary !== undefined) {
    dbUpdates.ai_summary = inc.aiSummary;
  }
  if (inc.recommendedResourceType !== undefined) {
    dbUpdates.recommended_resource_type = inc.recommendedResourceType;
  }
  if (inc.aiConfidence !== undefined) {
    dbUpdates.ai_confidence = inc.aiConfidence;
  }
  if (inc.assignedAt !== undefined) {
    dbUpdates.assigned_at = inc.assignedAt;
  }
  if (inc.resolvedAt !== undefined) {
    dbUpdates.resolved_at = inc.resolvedAt;
  }
  return dbUpdates;
}

export function mapDbResourceToUi(dbRes: any): Resource {
  let uiStatus: Resource["status"] = "Available";
  if (dbRes.status === "busy") {
    uiStatus = "Dispatched"; // or "Staged"
  } else if (dbRes.status === "offline") {
    uiStatus = "Maintenance";
  }

  return {
    id: dbRes.id,
    name: dbRes.name,
    type: (dbRes.resource_type || "POLICE") as Resource["type"],
    status: uiStatus,
    coordinates: [
      dbRes.latitude !== null && dbRes.latitude !== undefined ? Number(dbRes.latitude) : NaN,
      dbRes.longitude !== null && dbRes.longitude !== undefined ? Number(dbRes.longitude) : NaN
    ],
    fuel: 82, // Simulating fuel percentage
    crew: dbRes.resource_type === "POLICE" ? ["Officer Yadav"] : ["Crew Alpha"],
    location: dbRes.name + " Base"
  };
}

export function mapUiResourceToDb(res: Partial<Resource>) {
  const dbUpdates: any = {};
  if (res.name !== undefined) dbUpdates.name = res.name;
  if (res.type !== undefined) dbUpdates.resource_type = res.type;
  if (res.coordinates !== undefined) {
    dbUpdates.latitude = res.coordinates[0];
    dbUpdates.longitude = res.coordinates[1];
  }
  if (res.status !== undefined) {
    if (res.status === "Available") dbUpdates.status = "available";
    else if (res.status === "Dispatched" || res.status === "Staged") dbUpdates.status = "busy";
    else if (res.status === "Maintenance") dbUpdates.status = "offline";
  }
  return dbUpdates;
}

export function mapDbAlertToUi(dbAlert: any): Alert {
  return {
    id: dbAlert.id,
    title: dbAlert.title,
    message: dbAlert.message || "",
    severity: (dbAlert.severity || "INFO").toUpperCase() as Alert["severity"],
    timestamp: dbAlert.created_at || new Date().toISOString(),
    sectors: ["All Districts"],
    broadcasted: true
  };
}

export function mapDbIncidentEventToUi(dbEvent: any): IncidentEvent {
  return {
    id: dbEvent.id,
    incidentId: dbEvent.incident_id,
    eventType: dbEvent.event_type,
    description: dbEvent.description || "",
    createdAt: dbEvent.created_at || new Date().toISOString()
  };
}
