export interface Incident {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Unverified' | 'Dispatching' | 'On Scene' | 'Resolved';
  location: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  timestamp: string;
  assignedResources: string[]; // List of Resource IDs
  priorityScore?: number;
  aiSummary?: string;
  recommendedResourceType?: string;
  aiConfidence?: number;
  assignedAt?: string;
  resolvedAt?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'POLICE' | 'FIRE' | 'MEDICAL';
  status: 'Available' | 'Dispatched' | 'Staged' | 'Maintenance';
  coordinates: [number, number]; // [lat, lng]
  fuel: number; // Percentage 0-100
  crew: string[];
  location: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'SEVERE' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  sectors: string[];
  broadcasted: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  cardData?: {
    type: 'map' | 'chart' | 'generic';
    title: string;
    locationName?: string;
    coordinates?: [number, number];
    chartValues?: { label: string; value: number }[];
  };
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  eventType: string;
  description: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

