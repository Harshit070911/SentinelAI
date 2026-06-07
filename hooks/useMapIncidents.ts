import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { mapDbIncidentToUi } from "../lib/mappers";
import { IncidentService } from "../services/incident.service";

export function useMapIncidents() {
  useEffect(() => {
    // Fetch initial incidents
    const fetchInitial = async () => {
      try {
        useSentinelStore.getState().setSupabaseStatus("connected");
        await IncidentService.getIncidents();
      } catch (err) {
        console.error("Failed to fetch initial map incidents:", err);
        useSentinelStore.getState().setSupabaseStatus("error");
      }
    };
    fetchInitial();

    const channel = supabase
      .channel("realtime-map-incidents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const currentIncidents = useSentinelStore.getState().incidents;

          if (eventType === "INSERT") {
            const mapped = mapDbIncidentToUi(newRecord);
            const filtered = currentIncidents.filter((i) => i.id !== mapped.id);
            useSentinelStore.setState({ incidents: [mapped, ...filtered] });
          } else if (eventType === "UPDATE") {
            const mapped = mapDbIncidentToUi(newRecord);
            const updated = currentIncidents.map((inc) => 
              inc.id === mapped.id || inc.id === newRecord.id ? mapped : inc
            );
            useSentinelStore.setState({ incidents: updated });
          } else if (eventType === "DELETE") {
            const updated = currentIncidents.filter((inc) => inc.id !== oldRecord.id);
            useSentinelStore.setState({ incidents: updated });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime incidents subscription status:", status);
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
