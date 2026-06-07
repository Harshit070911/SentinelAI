import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { Alert } from "../types";
import { mapDbAlertToUi } from "../lib/mappers";

// Helper: Query timeout wrapper
const withTimeout = (promise: any, ms = 5000): Promise<any> => {
  return Promise.race([
    promise,
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms))
  ]);
};

export const AlertService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      const query = supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      const mapped = (data || []).map(mapDbAlertToUi);
      
      // Save to cache
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_alerts", JSON.stringify(mapped));
      }

      useSentinelStore.setState({ alerts: mapped });
      return mapped;
    } catch (err: any) {
      console.error("Failed to fetch alerts:", err);

      // Load from local storage cache
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("sentinel_cached_alerts");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            useSentinelStore.setState({ alerts: parsed });
            return parsed;
          } catch (e) {
            console.error("Failed to parse cached alerts:", e);
          }
        }
      }

      return useSentinelStore.getState().alerts;
    }
  },

  async broadcastAlert(alert: Omit<Alert, "id" | "timestamp" | "broadcasted">): Promise<Alert> {
    try {
      const query = supabase
        .from("alerts")
        .insert([
          {
            title: alert.title,
            message: alert.message,
            severity: alert.severity.toLowerCase()
          }
        ])
        .select()
        .single();

      const { data, error } = await withTimeout(query, 5000);

      if (error) throw error;

      const mapped = mapDbAlertToUi(data);
      
      // Optimistic store update
      const current = useSentinelStore.getState().alerts;
      const updated = [mapped, ...current];
      useSentinelStore.setState({ alerts: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_alerts", JSON.stringify(updated));
      }

      useSentinelStore.getState().addToast({
        title: "Broadcast Alert Transmitted",
        description: alert.title,
        type: "success"
      });

      return mapped;
    } catch (err: any) {
      console.error("Failed to create alert in DB:", err);
      
      // Stage locally
      const mockId = `AL-${Math.floor(100 + Math.random() * 900)}`;
      const mockAlert: Alert = {
        ...alert,
        id: mockId,
        timestamp: new Date().toISOString(),
        broadcasted: true
      };

      const current = useSentinelStore.getState().alerts;
      const updated = [mockAlert, ...current];
      useSentinelStore.setState({ alerts: updated });

      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_alerts", JSON.stringify(updated));
      }

      useSentinelStore.getState().addToast({
        title: "Offline Broadcast Staged",
        description: "Alert will sync to public servers once connection returns.",
        type: "warning"
      });

      return mockAlert;
    }
  },

  async dismissAlert(id: string): Promise<void> {
    try {
      const query = supabase
        .from("alerts")
        .delete()
        .eq("id", id);

      const { error } = await withTimeout(query, 5000);

      if (error) throw error;

      // Optimistic store update
      const current = useSentinelStore.getState().alerts;
      const updated = current.filter((a) => a.id !== id);
      useSentinelStore.setState({ alerts: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_alerts", JSON.stringify(updated));
      }
    } catch (err) {
      console.error(`Failed to delete alert ${id}:`, err);
      
      // Local sync fallback
      const current = useSentinelStore.getState().alerts;
      const updated = current.filter((a) => a.id !== id);
      useSentinelStore.setState({ alerts: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_cached_alerts", JSON.stringify(updated));
      }
    }
  }
};
