import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { mapDbIncidentToUi } from "../lib/mappers";

export function useIncidents() {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-incidents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const currentIncidents = useSentinelStore.getState().incidents;

          if (eventType === "INSERT") {
            const mapped = mapDbIncidentToUi(newRecord);
            // Prepend new incident to state, filtering out placeholder duplicate ids
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
