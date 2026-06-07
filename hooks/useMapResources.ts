import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { mapDbResourceToUi } from "../lib/mappers";
import { ResourceService } from "../services/resource.service";

export function useMapResources() {
  useEffect(() => {
    // Fetch initial resources
    const fetchInitial = async () => {
      try {
        useSentinelStore.getState().setSupabaseStatus("connected");
        await ResourceService.getResources();
      } catch (err) {
        console.error("Failed to fetch initial map resources:", err);
        useSentinelStore.getState().setSupabaseStatus("error");
      }
    };
    fetchInitial();

    const channel = supabase
      .channel("realtime-map-resources")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const currentResources = useSentinelStore.getState().resources;

          if (eventType === "INSERT") {
            const mapped = mapDbResourceToUi(newRecord);
            const filtered = currentResources.filter((r) => r.id !== mapped.id);
            useSentinelStore.setState({ resources: [...filtered, mapped] });
          } else if (eventType === "UPDATE") {
            const mapped = mapDbResourceToUi(newRecord);
            const updated = currentResources.map((res) => 
              res.id === mapped.id || res.id === newRecord.id ? mapped : res
            );
            useSentinelStore.setState({ resources: updated });
          } else if (eventType === "DELETE") {
            const updated = currentResources.filter((res) => res.id !== oldRecord.id);
            useSentinelStore.setState({ resources: updated });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime resources subscription status:", status);
        if (status === "SUBSCRIBED") {
          useSentinelStore.getState().setRealtimeConnected(true);
          useSentinelStore.getState().setSupabaseStatus("connected");
        } else if (status === "CLOSED" || status === "TIMED_OUT") {
          useSentinelStore.getState().setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
