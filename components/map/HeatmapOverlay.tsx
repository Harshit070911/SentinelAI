import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { Incident } from "@/types";

// Ensure leaflet.heat is only loaded on the client side
if (typeof window !== "undefined") {
  require("leaflet.heat");
}

interface HeatmapOverlayProps {
  incidents: Incident[];
  active: boolean;
}

export default function HeatmapOverlay({ incidents, active }: HeatmapOverlayProps) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    // Clear existing heat layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!active || incidents.length === 0) return;

    // Filter out resolved incidents and format into [lat, lng, weight]
    const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
    const points = activeIncidents.map((inc) => {
      const [lat, lng] = inc.coordinates;
      const priority = (inc.priority || "MEDIUM").toLowerCase();
      
      // Map severity to weight intensity values
      let weight = 0.4;
      if (priority === "critical") weight = 1.0;
      else if (priority === "high") weight = 0.7;
      else if (priority === "low") weight = 0.2;

      return [lat, lng, weight] as [number, number, number];
    });

    try {
      if ((L as any).heatLayer) {
        const heatLayer = (L as any).heatLayer(points, {
          radius: 35,
          blur: 22,
          maxZoom: 15,
          gradient: {
            0.2: "blue",
            0.5: "orange",
            1.0: "red",
          },
        });

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
      }
    } catch (err) {
      console.error("Failed to build Leaflet heat layer:", err);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, incidents, active]);

  return null;
}
