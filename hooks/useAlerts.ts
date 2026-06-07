import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { mapDbAlertToUi } from "../lib/mappers";

export function useAlerts() {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const currentAlerts = useSentinelStore.getState().alerts;

          if (eventType === "INSERT") {
            const mapped = mapDbAlertToUi(newRecord);
            const filtered = currentAlerts.filter((a) => a.id !== mapped.id);
            useSentinelStore.setState({ alerts: [mapped, ...filtered] });
          } else if (eventType === "UPDATE") {
            const mapped = mapDbAlertToUi(newRecord);
            const updated = currentAlerts.map((al) => 
              al.id === mapped.id || al.id === newRecord.id ? mapped : al
            );
            useSentinelStore.setState({ alerts: updated });
          } else if (eventType === "DELETE") {
            const updated = currentAlerts.filter((al) => al.id !== oldRecord.id);
            useSentinelStore.setState({ alerts: updated });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
