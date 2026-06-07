import { Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { Incident } from "@/types";
import { formatTime } from "@/lib/helpers";
import { useSentinelStore } from "@/store/useSentinelStore";
import { Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentMarkerProps {
  incident: Incident;
}

export default function IncidentMarker({ incident }: IncidentMarkerProps) {
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);
  const [latitude, longitude] = incident.coordinates;
  const position: [number, number] = [latitude, longitude];

  const priority = (incident.priority || "MEDIUM").toLowerCase();
  const isResolved = incident.status === "Resolved";

  // Color mappings
  // critical -> red
  // high -> orange
  // medium -> yellow
  // low -> blue
  let color = "#3b82f6"; // default low: blue
  let priorityColorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  let pulseHtml = "";

  if (isResolved) {
    color = "#9ca3af"; // gray
    priorityColorClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
  } else if (priority === "critical") {
    color = "#ef4444"; // red
    priorityColorClass = "bg-red-500/10 text-red-400 border-red-500/20";
    pulseHtml = `
      <div class="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
      <div class="absolute inset-1.5 rounded-full bg-red-500/50 animate-pulse"></div>
    `;
  } else if (priority === "high") {
    color = "#f97316"; // orange
    priorityColorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
  } else if (priority === "medium") {
    color = "#f59e0b"; // yellow
    priorityColorClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  } else if (priority === "low") {
    color = "#3b82f6"; // blue
    priorityColorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  const icon = L.divIcon({
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        ${pulseHtml}
        <div class="w-4 h-4 rounded-full border-2 border-[#0A0A0B] shadow-lg z-10" style="background-color: ${color};"></div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <>
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          weight: 2,
        }}
      />
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{
          click: () => {
            setSelectedIncidentId(incident.id);
          },
        }}
      >
        <Popup>
          <div className="p-2 min-w-[240px] font-sans">
            {/* Header */}
            <div className="flex justify-between items-center gap-4 mb-2 border-b border-white/10 pb-1.5">
              <span className="font-mono text-[10px] text-white/50 font-bold">#{incident.id}</span>
              <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase border tracking-wider",
                priorityColorClass
              )}>
                {incident.priority}
              </span>
            </div>
            
            {/* Details */}
            <h3 className="font-bold text-sm text-white mb-0.5">{incident.type}</h3>
            <p className="text-xs text-white/80 mb-2 italic">"{incident.location}"</p>
            
            {incident.description && (
              <p className="text-xs text-white/60 mb-2.5 leading-relaxed border-t border-white/5 pt-1.5">
                {incident.description}
              </p>
            )}

            {/* AI Intelligence Block */}
            {(incident.priorityScore !== undefined || incident.aiSummary || incident.recommendedResourceType) && (
              <div className="bg-white/5 rounded-lg p-2.5 mb-2 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#b4c5ff] uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>AI Emergency Analysis</span>
                </div>
                
                {incident.priorityScore !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Priority Score:</span>
                    <span className="font-mono font-bold text-white">{incident.priorityScore}</span>
                  </div>
                )}

                {incident.aiConfidence !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">AI Confidence:</span>
                    <span className="font-mono font-bold text-[#34d399]">{(incident.aiConfidence * 100).toFixed(0)}%</span>
                  </div>
                )}

                {incident.recommendedResourceType && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Rec. Resource:</span>
                    <span className="font-semibold text-[#ffb95f]">{incident.recommendedResourceType}</span>
                  </div>
                )}

                {incident.aiSummary && (
                  <p className="text-[11px] text-white/80 leading-snug border-t border-white/5 pt-1.5 italic">
                    {incident.aiSummary}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-[10px] text-white/40 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(incident.timestamp)}
              </span>
              <span className={cn(
                "font-bold uppercase tracking-wider text-[9px]",
                incident.status === "Resolved" 
                  ? "text-emerald-400" 
                  : incident.status === "Dispatching" 
                  ? "text-amber-400" 
                  : "text-blue-400"
              )}>
                {incident.status}
              </span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
