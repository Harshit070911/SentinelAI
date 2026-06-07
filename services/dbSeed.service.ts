import { supabase } from "../supabase/client";

// Mapped stable UUIDs for demo compatibility
export const SEED_RESOURCE_IDS = {
  "Ambulance A": "00000000-0000-0000-0000-000000000004",
  "Ambulance B": "00000000-0000-0000-0000-000000000009",
  "Fire Unit A": "00000000-0000-0000-0000-000000000012",
  "Police Unit A": "40240240-2402-4024-0240-240240240240",
  "Security Team A": "7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a"
};

export const SEED_INCIDENT_IDS = {
  "Fire at Gate 5": "84948494-8494-8494-8494-849484948494",
  "Medical Emergency Stage B": "84928492-8492-8492-8492-849284928492",
  "Crowd Panic Exit C": "84938493-8493-8493-8493-849384938493",
  "Lost Child Zone A": "84958495-8495-8495-8495-849584958495",
  "Suspicious Activity Parking Area": "84918491-8491-8491-8491-849184918491"
};

const SEED_RESOURCES = [
  {
    id: SEED_RESOURCE_IDS["Ambulance A"],
    name: "Ambulance A",
    resource_type: "MEDICAL",
    status: "busy",
    latitude: 28.4722,
    longitude: 77.0435,
    availability: false
  },
  {
    id: SEED_RESOURCE_IDS["Ambulance B"],
    name: "Ambulance B",
    resource_type: "MEDICAL",
    status: "available",
    latitude: 28.4320,
    longitude: 77.0050,
    availability: true
  },
  {
    id: SEED_RESOURCE_IDS["Fire Unit A"],
    name: "Fire Unit A",
    resource_type: "FIRE",
    status: "available",
    latitude: 28.4480,
    longitude: 77.0210,
    availability: true
  },
  {
    id: SEED_RESOURCE_IDS["Police Unit A"],
    name: "Police Unit A",
    resource_type: "POLICE",
    status: "available",
    latitude: 28.4600,
    longitude: 77.0580,
    availability: true
  },
  {
    id: SEED_RESOURCE_IDS["Security Team A"],
    name: "Security Team A",
    resource_type: "POLICE",
    status: "available",
    latitude: 28.4580,
    longitude: 77.0700,
    availability: true
  }
];

const SEED_INCIDENTS = [
  {
    id: SEED_INCIDENT_IDS["Fire at Gate 5"],
    title: "Fire at Gate 5",
    description: "Concession stand fire reported at Gate 5. Active flames visible. Evacuating surrounding sectors.",
    incident_type: "Fire",
    severity: "critical",
    status: "pending",
    latitude: 28.4625,
    longitude: 77.0306,
    reported_by: "Smoke Alarm Sensor 5B",
    assigned_resource: null,
    priority_score: 92.0,
    ai_summary: "Thermal signature escalation detected at Gate 5 concession stand. Immediate evacuation recommended.",
    recommended_resource_type: "Fire Unit",
    ai_confidence: 0.97
  },
  {
    id: SEED_INCIDENT_IDS["Medical Emergency Stage B"],
    title: "Medical Emergency Stage B",
    description: "Pedestrian collapsed near Stage B. Unresponsive but breathing. High crowd congestion reported.",
    incident_type: "Medical Emergency",
    severity: "high",
    status: "dispatched",
    latitude: 28.4722,
    longitude: 77.0435,
    reported_by: "Transit Operator",
    assigned_resource: SEED_RESOURCE_IDS["Ambulance A"],
    priority_score: 82.0,
    ai_summary: "Medical collapse near Stage B. First responders responding.",
    recommended_resource_type: "Ambulance",
    ai_confidence: 0.94,
    assigned_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: SEED_INCIDENT_IDS["Crowd Panic Exit C"],
    title: "Crowd Panic Exit C",
    description: "Escalated motion sensors and audio signatures indicate crowd rush panic near Exit C.",
    incident_type: "Crowd Panic",
    severity: "high",
    status: "pending",
    latitude: 28.4412,
    longitude: 77.0620,
    reported_by: "Audio Sensor Network",
    assigned_resource: null,
    priority_score: 88.0,
    ai_summary: "Crowd congestion towards Exit C doors. Triage dispatch recommended.",
    recommended_resource_type: "Police Unit",
    ai_confidence: 0.91
  },
  {
    id: SEED_INCIDENT_IDS["Lost Child Zone A"],
    title: "Lost Child Zone A",
    description: "Lost child reported. Male, 5yo, wearing red shorts and green cap. Last seen near playground slides.",
    incident_type: "Lost Child",
    severity: "medium",
    status: "resolved",
    latitude: 28.4555,
    longitude: 77.0326,
    reported_by: "Parent",
    assigned_resource: null,
    priority_score: 55.0,
    ai_summary: "Missing child reported near Zone A playground slides. Security dispatched.",
    recommended_resource_type: "Security Team",
    ai_confidence: 0.89,
    resolved_at: new Date().toISOString()
  },
  {
    id: SEED_INCIDENT_IDS["Suspicious Activity Parking Area"],
    title: "Suspicious Activity Parking Area",
    description: "Individual reported tampering with vehicle door handles in parking area B.",
    incident_type: "Suspicious Activity",
    severity: "low",
    status: "pending",
    latitude: 28.4590,
    longitude: 77.0725,
    reported_by: "Security Patrol",
    assigned_resource: null,
    priority_score: 32.0,
    ai_summary: "Perimeter intrusion risk flagged. Dispatch unit to parking area.",
    recommended_resource_type: "Police Unit",
    ai_confidence: 0.82
  }
];

const SEED_ALERTS = [
  {
    title: "Fire alert near Gate 5",
    message: "Immediate evacuation of Gate 5 concession area in progress. Emergency services responding.",
    severity: "critical"
  },
  {
    title: "Medical assistance dispatched",
    message: "Ambulance dispatched to Stage B. Keep routes clear for response vehicles.",
    severity: "high"
  },
  {
    title: "Crowd control activated",
    message: "Safety marshals dispatched to Exit C. Follow exit signage.",
    severity: "medium"
  }
];

const getSeedEvents = (incidentIds: { [key: string]: string }) => [
  {
    incident_id: incidentIds["Fire at Gate 5"],
    event_type: "Incident created",
    description: "Concession stand fire reported at Gate 5 by thermal sensor."
  },
  {
    incident_id: incidentIds["Fire at Gate 5"],
    event_type: "AI classified",
    description: "AI triage analyzer evaluated fire severity as CRITICAL."
  },
  {
    incident_id: incidentIds["Fire at Gate 5"],
    event_type: "Alert generated",
    description: "Public safety alert broadcasted: Evacuate Gate 5 vicinity."
  },
  {
    incident_id: incidentIds["Medical Emergency Stage B"],
    event_type: "Incident created",
    description: "Bystander reported pedestrian collapse near Stage B."
  },
  {
    incident_id: incidentIds["Medical Emergency Stage B"],
    event_type: "AI classified",
    description: "AI triage analyzer evaluated medical emergency severity as HIGH."
  },
  {
    incident_id: incidentIds["Medical Emergency Stage B"],
    event_type: "Resource dispatched",
    description: "Ambulance A dispatched to Stage B coordinates."
  },
  {
    incident_id: incidentIds["Crowd Panic Exit C"],
    event_type: "Incident created",
    description: "High density crowd surge towards Exit C doors detected."
  },
  {
    incident_id: incidentIds["Crowd Panic Exit C"],
    event_type: "AI classified",
    description: "AI classification complete. Priority score 88."
  },
  {
    incident_id: incidentIds["Lost Child Zone A"],
    event_type: "Incident created",
    description: "Parent reports lost child in Zone A play area."
  },
  {
    incident_id: incidentIds["Lost Child Zone A"],
    event_type: "Incident resolved",
    description: "Child reunited with parents. Case resolved."
  }
];

export const DbSeedService = {
  async seedIfEmpty(force: boolean = false): Promise<void> {
    try {
      console.log(`[DbSeedService] Checking database status for auto-seeding (force=${force})...`);

      if (force) {
        console.log("[DbSeedService] Cleaning old demo seed records...");
        // Clear incident events of our seeded incidents first to satisfy foreign keys
        await supabase
          .from("incident_events")
          .delete()
          .in("incident_id", Object.values(SEED_INCIDENT_IDS));

        // Clear seeded incidents
        await supabase
          .from("incidents")
          .delete()
          .in("id", Object.values(SEED_INCIDENT_IDS));

        // Clear seeded alerts
        await supabase
          .from("alerts")
          .delete()
          .in("title", SEED_ALERTS.map(a => a.title));

        // Clear seeded resources
        await supabase
          .from("resources")
          .delete()
          .in("id", Object.values(SEED_RESOURCE_IDS));
      }

      // 1. Seed Resources
      for (const res of SEED_RESOURCES) {
        const { data } = await supabase
          .from("resources")
          .select("id")
          .eq("id", res.id)
          .maybeSingle();

        if (!data) {
          console.log(`[DbSeedService] Seeding resource: ${res.name}`);
          await supabase.from("resources").insert([res]);
        }
      }

      // 2. Seed Incidents
      for (const inc of SEED_INCIDENTS) {
        const { data } = await supabase
          .from("incidents")
          .select("id")
          .eq("id", inc.id)
          .maybeSingle();

        if (!data) {
          console.log(`[DbSeedService] Seeding incident: ${inc.title}`);
          await supabase.from("incidents").insert([inc]);
        }
      }

      // 3. Seed Alerts
      for (const alert of SEED_ALERTS) {
        const { data } = await supabase
          .from("alerts")
          .select("id")
          .eq("title", alert.title)
          .maybeSingle();

        if (!data) {
          console.log(`[DbSeedService] Seeding alert: ${alert.title}`);
          await supabase.from("alerts").insert([alert]);
        }
      }

      // 4. Seed Incident Events
      const seedEvents = getSeedEvents(SEED_INCIDENT_IDS);
      for (const ev of seedEvents) {
        const { data } = await supabase
          .from("incident_events")
          .select("id")
          .eq("incident_id", ev.incident_id)
          .eq("event_type", ev.event_type)
          .maybeSingle();

        if (!data) {
          console.log(`[DbSeedService] Seeding incident event: ${ev.event_type}`);
          await supabase.from("incident_events").insert([ev]);
        }
      }

      console.log("[DbSeedService] Database seeding check completed successfully.");
    } catch (err) {
      console.error("[DbSeedService] Seeding operation failed:", err);
    }
  }
};
