"use client";

import { useEffect } from "react";
import { useIncidents } from "@/hooks/useIncidents";
import { useResources } from "@/hooks/useResources";
import { useAlerts } from "@/hooks/useAlerts";
import { IncidentService } from "@/services/incident.service";
import { ResourceService } from "@/services/resource.service";
import { AlertService } from "@/services/alert.service";
import { DbSeedService } from "@/services/dbSeed.service";

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  // Bind database event listeners
  useIncidents();
  useResources();
  useAlerts();

  // Query database state once on initial render
  useEffect(() => {
    const initDatabaseState = async () => {
      try {
        // Automatically inject demo scenarios if database is empty
        await DbSeedService.seedIfEmpty();

        await Promise.all([
          IncidentService.getIncidents(),
          ResourceService.getResources(),
          AlertService.getAlerts()
        ]);
      } catch (err) {
        console.error("Failed to fetch initial database state:", err);
      }
    };
    initDatabaseState();
  }, []);

  return <>{children}</>;
}
