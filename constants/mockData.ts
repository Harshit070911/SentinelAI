import { Incident, Resource, Alert, Message } from "../types";

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-8491",
    type: "Armed Robbery",
    priority: "CRITICAL",
    status: "On Scene",
    location: "Downtown, Sector 29 Bank",
    coordinates: [28.4590, 77.0725],
    description: "Silent alarm triggered at state bank branch. Multiple suspects reported inside. Hostage status unconfirmed. SWAT Unit 7A staged nearby.",
    timestamp: "2026-06-06T13:58:12Z",
    assignedResources: ["U-7A"]
  },
  {
    id: "INC-8492",
    type: "Medical Emergency",
    priority: "HIGH",
    status: "Dispatching",
    location: "Sector 14 Transit Hub",
    coordinates: [28.4722, 77.0435],
    description: "Pedestrian collapsed on transit platform. Unresponsive but breathing. High crowd congestion reported. Ambulance Medic 4 dispatched.",
    timestamp: "2026-06-06T14:02:45Z",
    assignedResources: ["M-4"]
  },
  {
    id: "INC-8490",
    type: "Traffic Collision",
    priority: "MEDIUM",
    status: "Resolved",
    location: "NH-48 highway, MM 42",
    coordinates: [28.4390, 77.0110],
    description: "Two-vehicle minor collision. No injuries reported. Left lane blocked causing moderate backups. Traffic units cleared the scene.",
    timestamp: "2026-06-06T13:20:00Z",
    assignedResources: []
  },
  {
    id: "INC-8489",
    type: "Disturbance",
    priority: "LOW",
    status: "Resolved",
    location: "Residential Complex, Sector 43",
    coordinates: [28.4912, 77.0878],
    description: "Noise complaint regarding a neighborhood gathering. Dispatched patrol unit advised hosts to move indoors. Peace restored.",
    timestamp: "2026-06-06T12:45:00Z",
    assignedResources: []
  },
  {
    id: "INC-8493",
    type: "Substation Security Breach",
    priority: "CRITICAL",
    status: "Unverified",
    location: "Power Substation B, Sector 45",
    coordinates: [28.4412, 77.0620],
    description: "Motion sensors triggered on perimeter fence. Visual feed obstructed by thermal shroud. Dispatch patrol unit to investigate potential intrusion.",
    timestamp: "2026-06-06T14:05:00Z",
    assignedResources: []
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: "U-7A",
    name: "Unit 7A (SWAT)",
    type: "POLICE",
    status: "Dispatched",
    coordinates: [28.4580, 77.0700],
    fuel: 85,
    crew: ["Officer Sharma", "Officer Singh", "Officer Negi"],
    location: "Sector 29 Staging Area"
  },
  {
    id: "U-402",
    name: "Unit 402 (Patrol)",
    type: "POLICE",
    status: "Available",
    coordinates: [28.4600, 77.0580],
    fuel: 92,
    crew: ["Officer Yadav", "Officer Kumar"],
    location: "Sector 45 Patrol Grid"
  },
  {
    id: "M-4",
    name: "Medic 4 (Ambulance)",
    type: "MEDICAL",
    status: "Dispatched",
    coordinates: [28.4680, 77.0390],
    fuel: 74,
    crew: ["Paramedic Khan", "Paramedic Roy"],
    location: "Sukhdev Vihar Standby"
  },
  {
    id: "F-12",
    name: "Engine 12 (Fire)",
    type: "FIRE",
    status: "Available",
    coordinates: [28.4480, 77.0210],
    fuel: 68,
    crew: ["Captain Gupta", "Firefighter Lal", "Firefighter Das"],
    location: "Sector 14 Fire HQ"
  },
  {
    id: "M-9",
    name: "Medic 9 (Ambulance)",
    type: "MEDICAL",
    status: "Maintenance",
    coordinates: [28.4320, 77.0050],
    fuel: 20,
    crew: [],
    location: "District Depot Maintenance Shop"
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "AL-101",
    title: "System-Wide Alert: Major Incident",
    severity: "CRITICAL",
    message: "All operational command units report status. Prepare for dynamic task allocation vectors under AI telemetry guidance.",
    timestamp: "2026-06-06T14:00:00Z",
    sectors: ["All Districts"],
    broadcasted: true
  },
  {
    id: "AL-102",
    title: "Weather Warning: Heavy Rainfall",
    severity: "WARNING",
    message: "Waterlogging potential at Sector 14 underpasses and NH-48 lanes. Reroute backup response vehicles.",
    timestamp: "2026-06-06T13:45:00Z",
    sectors: ["Sector 14", "NH-48 Corridor"],
    broadcasted: true
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Good afternoon, Commander Hayes. All monitoring networks are operational. We are tracking 5 units and 1 unverified breach at Power Substation B, Sector 45. Ready for active instructions.",
    timestamp: "2026-06-06T14:02:45Z"
  }
];
