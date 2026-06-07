import { create } from "zustand";
import { Incident, Resource, Alert, Message, ToastMessage } from "../types";
import { INITIAL_INCIDENTS, INITIAL_RESOURCES, INITIAL_ALERTS, INITIAL_MESSAGES } from "../constants/mockData";

interface SentinelState {
  incidents: Incident[];
  resources: Resource[];
  alerts: Alert[];
  messages: Message[];
  selectedIncidentId: string | null;
  selectedResourceId: string | null;
  realtimeConnected: boolean;
  supabaseStatus: "connected" | "disconnected" | "error";
  toasts: ToastMessage[];
  demoMode: boolean;
  
  // Basic Setters
  setIncidents: (incidents: Incident[]) => void;
  setResources: (resources: Resource[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setMessages: (messages: Message[]) => void;
  setSelectedIncidentId: (id: string | null) => void;
  setSelectedResourceId: (id: string | null) => void;
  setRealtimeConnected: (connected: boolean) => void;
  setSupabaseStatus: (status: "connected" | "disconnected" | "error") => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  setDemoMode: (enabled: boolean) => void;
  
  // Actions
  dispatchUnit: (incidentId: string, resourceId: string) => void;
  releaseUnit: (incidentId: string, resourceId: string) => void;
  resolveIncidentState: (incidentId: string) => void;
  addAlertState: (alert: Alert) => void;
  addMessageState: (message: Message) => void;
  updateResourceState: (resourceId: string, updates: Partial<Resource>) => void;
  updateIncidentState: (incidentId: string, updates: Partial<Incident>) => void;
}

export const useSentinelStore = create<SentinelState>((set) => ({
  incidents: INITIAL_INCIDENTS,
  resources: INITIAL_RESOURCES,
  alerts: INITIAL_ALERTS,
  messages: INITIAL_MESSAGES,
  selectedIncidentId: null,
  selectedResourceId: null,
  realtimeConnected: false,
  supabaseStatus: "connected",
  toasts: [],
  demoMode: true, // Presentation mode defaults to active for judge convenience

  setIncidents: (incidents) => set({ incidents }),
  setResources: (resources) => set({ resources }),
  setAlerts: (alerts) => set({ alerts }),
  setMessages: (messages) => set({ messages }),
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
  setSelectedResourceId: (id) => set({ selectedResourceId: id }),
  setRealtimeConnected: (realtimeConnected) => set({ realtimeConnected }),
  setSupabaseStatus: (supabaseStatus) => set({ supabaseStatus }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto dismiss after duration unless duration is 0
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 4000);
    }
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setDemoMode: (demoMode) => set({ demoMode }),

  dispatchUnit: (incidentId, resourceId) =>
    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const assigned = inc.assignedResources.includes(resourceId)
            ? inc.assignedResources
            : [...inc.assignedResources, resourceId];
          return {
            ...inc,
            assignedResources: assigned,
            status: inc.status === "Unverified" ? "Dispatching" : inc.status,
          };
        }
        return inc;
      });

      const updatedResources = state.resources.map((res) => {
        if (res.id === resourceId) {
          return { ...res, status: "Dispatched" as const };
        }
        return res;
      });

      return {
        incidents: updatedIncidents,
        resources: updatedResources,
      };
    }),

  releaseUnit: (incidentId, resourceId) =>
    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            assignedResources: inc.assignedResources.filter((id) => id !== resourceId),
          };
        }
        return inc;
      });

      const updatedResources = state.resources.map((res) => {
        if (res.id === resourceId) {
          return { ...res, status: "Available" as const };
        }
        return res;
      });

      return {
        incidents: updatedIncidents,
        resources: updatedResources,
      };
    }),

  resolveIncidentState: (incidentId) =>
    set((state) => {
      // Find assigned resources first
      const incident = state.incidents.find((i) => i.id === incidentId);
      const releasedResourceIds = incident ? incident.assignedResources : [];

      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: "Resolved" as const,
            assignedResources: [],
          };
        }
        return inc;
      });

      const updatedResources = state.resources.map((res) => {
        if (releasedResourceIds.includes(res.id)) {
          return { ...res, status: "Available" as const };
        }
        return res;
      });

      return {
        incidents: updatedIncidents,
        resources: updatedResources,
      };
    }),

  addAlertState: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  addMessageState: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateResourceState: (resourceId, updates) =>
    set((state) => ({
      resources: state.resources.map((res) =>
        res.id === resourceId ? { ...res, ...updates } : res
      ),
    })),

  updateIncidentState: (incidentId, updates) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, ...updates } : inc
      ),
    })),
}));
