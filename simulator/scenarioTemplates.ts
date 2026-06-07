export interface ScenarioStep {
  timeOffset: number; // T+ seconds relative to start
  type: "incident" | "alert" | "event";
  incidentType?: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  coordinates?: [number, number];
  peopleAffected?: number;
  recommendedResource?: "FIRE" | "MEDICAL" | "POLICE" | "SECURITY";
  cascadeAfterSeconds?: number;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  category: "Fire" | "Medical Emergency" | "Crowd Panic" | "Stampede" | "Lost Child" | "Violence" | "Suspicious Activity" | "Infrastructure Failure";
  initialCoordinates: [number, number];
  steps: ScenarioStep[];
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: "fire-gate-5",
    title: "Fire at Gate 5",
    description: "Concession stand fire spreading smoke into the main arena. Evacuation required.",
    category: "Fire",
    initialCoordinates: [28.4625, 77.0306],
    steps: [
      {
        timeOffset: 0,
        type: "incident",
        incidentType: "Fire",
        title: "Fire at Gate 5 Concession Stand",
        description: "Heavy smoke and flames reported at Gate 5 concession area. Store clerk reporting electrical spark failure.",
        severity: "critical",
        coordinates: [28.4625, 77.0306],
        peopleAffected: 35,
        recommendedResource: "FIRE"
      },
      {
        timeOffset: 20,
        type: "alert",
        title: "Evacuation Alert: Gate 5 Area",
        description: "Safety warning broadcast: Evacuate Gate 5 vicinity immediately due to structural smoke.",
        severity: "high"
      },
      {
        timeOffset: 35,
        type: "incident",
        incidentType: "Medical Emergency",
        title: "Smoke Inhalation near Gate 5",
        description: "Cascading Emergency: Multiple spectators experiencing respiratory distress from concession smoke.",
        severity: "high",
        coordinates: [28.4630, 77.0315],
        peopleAffected: 4,
        recommendedResource: "MEDICAL"
      }
    ]
  },
  {
    id: "med-stage-b",
    title: "Medical Emergency Stage B",
    description: "An elderly spectator collapsed due to heat exhaustion and chest pain.",
    category: "Medical Emergency",
    initialCoordinates: [28.4575, 77.0226],
    steps: [
      {
        timeOffset: 0,
        type: "incident",
        incidentType: "Medical Emergency",
        title: "Cardiac Distress at Stage B",
        description: "Specator collapsed near sound booth, breathing but unresponsive. Defibrillator requested.",
        severity: "high",
        coordinates: [28.4575, 77.0226],
        peopleAffected: 1,
        recommendedResource: "MEDICAL"
      }
    ]
  },
  {
    id: "stampede-exit-c",
    title: "Stampede Near Exit C",
    description: "Sudden surge of crowds trying to exit due to a false alarm breach, causing congestion and trips.",
    category: "Stampede",
    initialCoordinates: [28.4645, 77.0210],
    steps: [
      {
        timeOffset: 0,
        type: "incident",
        incidentType: "Stampede",
        title: "Crowd Rush near Exit C Corridor",
        description: "High density crowd surge towards Exit C doors. Spectators report pushing and several falling injuries.",
        severity: "critical",
        coordinates: [28.4645, 77.0210],
        peopleAffected: 60,
        recommendedResource: "POLICE"
      },
      {
        timeOffset: 15,
        type: "incident",
        incidentType: "Medical Emergency",
        title: "Trample Injuries at Exit C",
        description: "Cascading Event: 5 spectators suffered minor fractures and cuts during crowd compression.",
        severity: "high",
        coordinates: [28.4648, 77.0205],
        peopleAffected: 5,
        recommendedResource: "MEDICAL"
      }
    ]
  },
  {
    id: "lost-child-zone-a",
    title: "Lost Child Zone A",
    description: "Missing toddler reported near the Zone A play area. Mother requesting security scanning assistance.",
    category: "Lost Child",
    initialCoordinates: [28.4555, 77.0326],
    steps: [
      {
        timeOffset: 0,
        type: "incident",
        incidentType: "Lost Child",
        title: "Missing 5-year-old in Play Area",
        description: "Lost child reported. Male, 5yo, wearing red shorts and green cap. Last seen near playground slides.",
        severity: "medium",
        coordinates: [28.4555, 77.0326],
        peopleAffected: 2,
        recommendedResource: "SECURITY"
      }
    ]
  },
  {
    id: "violence-gate-1",
    title: "Violence Near Entry Gate",
    description: "Physical altercation broke out between fans waiting in queue at Ticket Booth.",
    category: "Violence",
    initialCoordinates: [28.4610, 77.0180],
    steps: [
      {
        timeOffset: 0,
        type: "incident",
        incidentType: "Violence",
        title: "Brawl at Ticket Booth",
        description: "Fistfight involving 6 individuals blocking entrance turnstiles. Staff requests urgent police containment.",
        severity: "high",
        coordinates: [28.4610, 77.0180],
        peopleAffected: 8,
        recommendedResource: "POLICE"
      }
    ]
  }
];
