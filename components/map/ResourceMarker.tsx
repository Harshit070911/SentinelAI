import { Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { Resource } from "@/types";
import { useSentinelStore } from "@/store/useSentinelStore";
import { MapService } from "@/services/map.service";
import { Shield, Truck, Info, BatteryCharging } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceMarkerProps {
  resource: Resource;
}

export default function ResourceMarker({ resource }: ResourceMarkerProps) {
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const incidents = useSentinelStore((state) => state.incidents);
  const setSelectedResourceId = useSentinelStore((state) => state.setSelectedResourceId);
  const [latitude, longitude] = resource.coordinates;
  const position: [number, number] = [latitude, longitude];

  const selectedIncident = incidents.find(
    (i) => i.id === selectedIncidentId && i.status !== "Resolved"
  );

  const status = resource.status || "Available";
  const isAvailable = status === "Available";
  const typeLower = (resource.type || "").toLowerCase();

  // Resource Icon custom configurations
  let bgColor = "bg-primary border-primary text-white shadow-[0_0_12px_rgba(180,197,255,0.5)]";
  let displayType = "Resource Crew";
  let iconText = "R";
  let circleColor = "#6366f1";

  if (typeLower.includes("fire")) {
    bgColor = "bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]";
    displayType = "Fire Unit";
    iconText = "F";
    circleColor = "#dc2626";
  } else if (typeLower.includes("medical") || typeLower.includes("ambulance")) {
    bgColor = "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]";
    displayType = "Ambulance";
    iconText = "M";
    circleColor = "#059669";
  } else if (typeLower.includes("police")) {
    bgColor = "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]";
    displayType = "Police Unit";
    iconText = "P";
    circleColor = "#2563eb";
  } else if (typeLower.includes("security")) {
    bgColor = "bg-indigo-700 border-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]";
    displayType = "Security Team";
    iconText = "S";
    circleColor = "#4f46e5";
  }

  const pulseBorder = status === "Dispatched" || status === "Staged" ? "animate-pulse" : "";

  const icon = L.divIcon({
    html: `
      <div class="w-8 h-8 rounded-lg border border-white/20 ${bgColor} ${pulseBorder} flex items-center justify-center text-xs font-black font-mono shadow-md">
        ${iconText}
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Calculate dynamic ETA and distance to selected incident
  let etaText = "Staged / Idle";
  if (selectedIncident) {
    const dist = MapService.calculateDistance(selectedIncident.coordinates, resource.coordinates);
    const etaMin = MapService.estimateETA(dist, resource.type);
    etaText = `${etaMin} min (${dist.toFixed(1)} km)`;
  }

  return (
    <>
      <CircleMarker
        center={position}
        radius={6}
        pathOptions={{
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.6,
          weight: 1.5,
        }}
      />
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{
          click: () => {
            setSelectedResourceId(resource.id);
          },
        }}
      >
        <Popup>
          <div className="p-2 min-w-[220px] font-sans">
            {/* Header */}
            <div className="flex justify-between items-center gap-4 mb-2 border-b border-white/10 pb-1.5">
              <span className="font-mono text-[10px] text-white/50 font-bold">{resource.id}</span>
              <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase border tracking-wider",
                isAvailable 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {isAvailable ? "Available" : "Busy"}
              </span>
            </div>

            {/* Details */}
            <h3 className="font-bold text-sm text-white mb-0.5">{resource.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-white/60 mb-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>{displayType}</span>
            </div>

            <div className="bg-white/5 rounded-lg p-2 mb-2.5 border border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Telemetry Status:</span>
                <span className={cn(
                  "font-semibold",
                  status === "Available" 
                    ? "text-emerald-400" 
                    : status === "Dispatched" 
                    ? "text-amber-400 animate-pulse" 
                    : "text-blue-400"
                )}>
                  {status}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-white/60">Selected Target ETA:</span>
                <span className="font-mono font-bold text-[#b4c5ff]">{etaText}</span>
              </div>

              {resource.fuel !== undefined && (
                <div className="flex justify-between text-xs items-center">
                  <span className="text-white/60 flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3" /> Fuel/Charge:
                  </span>
                  <span className="font-mono font-bold text-white">{resource.fuel}%</span>
                </div>
              )}
            </div>

            {resource.crew && resource.crew.length > 0 && (
              <div className="text-[10px] text-white/40 pt-1 border-t border-white/5 flex items-center gap-1">
                <Truck className="w-3 h-3 text-white/30" />
                <span>Crew: {resource.crew.join(", ")}</span>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}
