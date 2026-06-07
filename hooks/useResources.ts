import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useSentinelStore } from "../store/useSentinelStore";
import { mapDbResourceToUi } from "../lib/mappers";

export function useResources() {
  useEffect(() => {
    const channel = supabase
      .channel("realtime-resources")
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
