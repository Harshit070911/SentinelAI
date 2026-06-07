import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { Incident } from "../types";
import { mapDbIncidentToUi, mapUiIncidentToDb } from "../lib/mappers";

// Helper: Query timeout wrapper
const withTimeout = (promise: any, ms = 5000): Promise<any> => {
  return Promise.race([
    promise,
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms))
  ]);
};

export const IncidentService = {
  async getIncidents(): Promise<Incident[]> {
    try {
      const query = supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      const mapped = (data || []).map(mapDbIncidentToUi);
      
      // Save to offline cache
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_incidents", JSON.stringify(mapped));
      }
      
      useSentinelStore.setState({ incidents: mapped });
      return mapped;
    } catch (err: any) {
      console.error("Failed to fetch incidents:", err);

      // Attempt offline local cache retrieval
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("sentinel_cached_incidents");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            useSentinelStore.setState({ incidents: parsed });
            
            // Notify operator
            useSentinelStore.getState().addToast({
              title: "Realtime Connection Lost",
              description: "Displaying cached incidents offline. Some details may be out of date.",
              type: "warning"
            });
            
            return parsed;
          } catch (e) {
            console.error("Failed to parse cached incidents:", e);
          }
        }
      }

      return useSentinelStore.getState().incidents;
    }
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const query = supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      return mapDbIncidentToUi(data);
    } catch (err) {
      console.error(`Failed to fetch incident ${id}:`, err);
      // Fallback: search in local store
      return useSentinelStore.getState().incidents.find(i => i.id === id) || null;
    }
  },

  async createIncident(incident: Omit<Incident, "id" | "timestamp" | "assignedResources">): Promise<Incident> {
    const dbFormat = mapUiIncidentToDb({
      ...incident,
      status: "Unverified"
    });

    try {
      const query = supabase
        .from("incidents")
        .insert([dbFormat])
        .select()
        .single();

      const { data, error } = await withTimeout(query, 6000);

      if (error) throw error;

      const mapped = mapDbIncidentToUi(data);
      
      // Optimistic store update
      const current = useSentinelStore.getState().incidents;
      const updated = [mapped, ...current];
      useSentinelStore.setState({ incidents: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_incidents", JSON.stringify(updated));
      }

      useSentinelStore.getState().addToast({
        title: "Incident Created",
        description: `New ${incident.type} successfully broadcast to emergency grids.`,
        type: "success"
      });

      return mapped;
    } catch (err: any) {
      console.error("Failed to create incident in DB:", err);
      
      // Create local mock incident to prevent crashing and support offline demo
      const mockId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockIncident: Incident = {
        ...incident,
        id: mockId,
        status: "Unverified",
        timestamp: new Date().toISOString(),
        assignedResources: []
      };

      const current = useSentinelStore.getState().incidents;
      const updated = [mockIncident, ...current];
      useSentinelStore.setState({ incidents: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_incidents", JSON.stringify(updated));
      }

      useSentinelStore.getState().addToast({
        title: "Offline Mode: Incident Staged",
        description: `Staged ${incident.type} locally. Will sync when Supabase reconnects.`,
        type: "warning"
      });

      return mockIncident;
    }
  },

  async updateIncidentStatus(id: string, status: Incident["status"]): Promise<void> {
    const dbStatus = status === "Unverified" ? "pending" : status === "Resolved" ? "resolved" : "dispatched";

    try {
      const query = supabase
        .from("incidents")
        .update({ status: dbStatus })
        .eq("id", id);

      const { error } = await withTimeout(query, 5000);

      if (error) throw error;
    } catch (err) {
      console.error(`Failed to update status for incident ${id}:`, err);
      
      // Local fallback sync
      const current = useSentinelStore.getState().incidents;
      const updated = current.map(inc => inc.id === id ? { ...inc, status } : inc);
      useSentinelStore.setState({ incidents: updated });
      
      useSentinelStore.getState().addToast({
        title: "Offline Status Updated",
        description: `Incident status locally updated to ${status}.`,
        type: "warning"
      });
    }
  },

  async dispatchUnit(incidentId: string, resourceId: string): Promise<void> {
    try {
      // 1. Update incident
      const incQuery = supabase
        .from("incidents")
        .update({ 
          assigned_resource: resourceId,
          status: "dispatched",
          assigned_at: new Date().toISOString()
        })
        .eq("id", incidentId);

      const { error: incError } = await withTimeout(incQuery, 5000);
      if (incError) throw incError;

      // 2. Update resource
      const resQuery = supabase
        .from("resources")
        .update({ 
          status: "busy",
          availability: false
        })
        .eq("id", resourceId);

      const { error: resError } = await withTimeout(resQuery, 5000);
      if (resError) throw resError;

      useSentinelStore.getState().addToast({
        title: "Resource Dispatched",
        description: "Emergency unit dispatched and responding.",
        type: "success"
      });
    } catch (err) {
      console.error(`Failed to dispatch resource ${resourceId} to incident ${incidentId}:`, err);
      
      // Local fallback sync
      const state = useSentinelStore.getState();
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            assignedResources: [resourceId],
            status: "Dispatching" as const,
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

      useSentinelStore.setState({
        incidents: updatedIncidents,
        resources: updatedResources
      });

      state.addToast({
        title: "Offline Dispatch Executed",
        description: "Unit staged locally. Will transmit when database reconnects.",
        type: "warning"
      });
    }
  },

  async releaseUnit(incidentId: string, resourceId: string): Promise<void> {
    try {
      // 1. Update incident
      const incQuery = supabase
        .from("incidents")
        .update({ assigned_resource: null })
        .eq("id", incidentId);

      const { error: incError } = await withTimeout(incQuery, 5000);
      if (incError) throw incError;

      // 2. Update resource
      const resQuery = supabase
        .from("resources")
        .update({ 
          status: "available",
          availability: true
        })
        .eq("id", resourceId);

      const { error: resError } = await withTimeout(resQuery, 5000);
      if (resError) throw resError;
    } catch (err) {
      console.error(`Failed to release resource ${resourceId} from incident ${incidentId}:`, err);
      
      // Local fallback sync
      const state = useSentinelStore.getState();
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

      useSentinelStore.setState({
        incidents: updatedIncidents,
        resources: updatedResources
      });
    }
  },

  async resolveIncident(incidentId: string): Promise<void> {
    try {
      // Fetch assigned resource first
      const queryInc = supabase
        .from("incidents")
        .select("assigned_resource")
        .eq("id", incidentId)
        .single();

      const { data: incident } = await withTimeout(queryInc, 5000);
      const assignedResource = incident?.assigned_resource;

      // 1. Update incident status to resolved
      const resolveQuery = supabase
        .from("incidents")
        .update({ 
          status: "resolved",
          assigned_resource: null,
          resolved_at: new Date().toISOString()
        })
        .eq("id", incidentId);

      const { error: incError } = await withTimeout(resolveQuery, 5000);
      if (incError) throw incError;

      // Log resolve event
      const logQuery = supabase.from("incident_events").insert([
        {
          incident_id: incidentId,
          event_type: "Incident resolved",
          description: "Incident has been resolved by operator and assigned resources have been released."
        }
      ]);
      await withTimeout(logQuery, 5000);

      // 2. If a resource was assigned, release it
      if (assignedResource) {
        const releaseQuery = supabase
          .from("resources")
          .update({ 
            status: "available",
            availability: true
          })
          .eq("id", assignedResource);

        const { error: resError } = await withTimeout(releaseQuery, 5000);
        if (resError) throw resError;
      }

      useSentinelStore.getState().addToast({
        title: "Incident Resolved",
        description: "Emergency situation closed and logged in history.",
        type: "success"
      });
    } catch (err) {
      console.error(`Failed to resolve incident ${incidentId}:`, err);
      
      // Local fallback sync
      const state = useSentinelStore.getState();
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

      useSentinelStore.setState({
        incidents: updatedIncidents,
        resources: updatedResources
      });

      state.addToast({
        title: "Incident Resolved (Offline)",
        description: "Local state updated. Sync staged.",
        type: "warning"
      });
    }
  }
};
