import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { Resource } from "../types";
import { mapDbResourceToUi } from "../lib/mappers";

// Helper: Query timeout wrapper
const withTimeout = (promise: any, ms = 5000): Promise<any> => {
  return Promise.race([
    promise,
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms))
  ]);
};

export const ResourceService = {
  async getResources(): Promise<Resource[]> {
    try {
      const query = supabase
        .from("resources")
        .select("*");

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      const mapped = (data || []).map(mapDbResourceToUi);
      
      // Save to cache
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_resources", JSON.stringify(mapped));
      }

      useSentinelStore.setState({ resources: mapped });
      return mapped;
    } catch (err: any) {
      console.error("Failed to fetch resources:", err);

      // Load from local storage cache
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("sentinel_cached_resources");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            useSentinelStore.setState({ resources: parsed });
            return parsed;
          } catch (e) {
            console.error("Failed to parse cached resources:", e);
          }
        }
      }

      return useSentinelStore.getState().resources;
    }
  },

  async getResourceById(id: string): Promise<Resource | null> {
    try {
      const query = supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .single();

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      return mapDbResourceToUi(data);
    } catch (err) {
      console.error(`Failed to fetch resource ${id}:`, err);
      return useSentinelStore.getState().resources.find(r => r.id === id) || null;
    }
  },

  async updateResourceStatus(id: string, status: Resource["status"]): Promise<void> {
    const dbStatus = status === "Available" ? "available" : status === "Maintenance" ? "offline" : "busy";
    const availability = status === "Available";

    try {
      const query = supabase
        .from("resources")
        .update({ 
          status: dbStatus,
          availability 
        })
        .eq("id", id);

      const { error } = await withTimeout(query, 5000);

      if (error) throw error;
    } catch (err) {
      console.error(`Failed to update status for resource ${id}:`, err);

      // Local fallback sync
      const current = useSentinelStore.getState().resources;
      const updated = current.map(res => res.id === id ? { ...res, status } : res);
      useSentinelStore.setState({ resources: updated });

      useSentinelStore.getState().addToast({
        title: "Resource Synced Locally",
        description: `Staged unit status update to ${status}.`,
        type: "warning"
      });
    }
  },

  async updateResourceLocation(id: string, coordinates: [number, number], locationName?: string): Promise<void> {
    try {
      const query = supabase
        .from("resources")
        .update({ 
          latitude: coordinates[0],
          longitude: coordinates[1]
        })
        .eq("id", id);

      const { error } = await withTimeout(query, 5000);

      if (error) throw error;
    } catch (err) {
      console.error(`Failed to update location for resource ${id}:`, err);
      
      // Local sync fallback
      const current = useSentinelStore.getState().resources;
      const updated = current.map(res => res.id === id ? { ...res, coordinates } : res);
      useSentinelStore.setState({ resources: updated });
    }
  }
};
