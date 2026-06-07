"use client";

import { useSentinelStore } from "../../store/useSentinelStore";
import { MapService } from "../../services/map.service";
import { IncidentService } from "../../services/incident.service";
import { supabase } from "../../supabase/client";
import { Brain, MapPin, Check, Truck, ShieldAlert, Award, Compass } from "lucide-react";
import { cn } from "../../lib/utils";

export default function DispatchOverlay() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);

  const activeIncident = incidents.find(
    (i) => i.id === selectedIncidentId && i.status !== "Resolved"
  );

  // If no incident is selected, find the first unassigned or active incident
  const fallbackIncident = incidents.find(
    (i) => i.status !== "Resolved" && i.assignedResources.length === 0
  );

  const displayedIncident = activeIncident || fallbackIncident;

  if (!displayedIncident) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-primary/10 select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-surface-container-lowest/95 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">AI Dispatch Rec</span>
        </div>
        <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed">
          Select an active incident from the timeline or map to calculate unit proximity grids and transmit dispatch instructions.
        </p>
      </div>
    );
  }

  // Calculate distances and ETAs for all resources
  const nearbyUnits = MapService.getNearbyResources(displayedIncident.coordinates, resources);

  // Identify recommended resource type
  const recType = (displayedIncident.recommendedResourceType || "").toUpperCase();

  // Find nearest available unit matching recommended type, or fallback to closest available
  const nearestMatching = nearbyUnits.find(
    (u) => u.status === "Available" && 
    (recType.includes(u.type.toUpperCase()) || u.type.toUpperCase().includes(recType))
  );
  
  const nearestAny = nearbyUnits.find((u) => u.status === "Available");
  const recommendedUnit = nearestMatching || nearestAny;

  const handleDispatch = async (unitId: string, unitName: string, eta: number, dist: number) => {
    try {
      await IncidentService.dispatchUnit(displayedIncident.id, unitId);
      
      // Insert a real-time event log
      await supabase.from("incident_events").insert([
        {
          incident_id: displayedIncident.id,
          event_type: "Resource dispatched",
          description: `Unit ${unitName} dispatched to ${displayedIncident.location}. ETA: ${eta} min (${dist.toFixed(1)} km away).`,
        },
      ]);

      // Update incident status to dispatching
      if (displayedIncident.status === "Unverified") {
        await IncidentService.updateIncidentStatus(displayedIncident.id, "Dispatching");
      }
    } catch (err) {
      console.error("Dispatch execution failed:", err);
    }
  };

  const handleResolve = async () => {
    await IncidentService.resolveIncident(displayedIncident.id);
    setSelectedIncidentId(null);
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-primary/20 shadow-[0_6px_30px_rgba(0,0,0,0.4)] bg-surface-container-lowest/95 backdrop-blur-md">
      {/* Title Header */}
      <div className="bg-primary-container/10 px-4 py-2.5 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4.5 h-4.5 text-primary" />
          <span className="text-[10px] font-black text-primary tracking-widest uppercase font-mono-data">
            AI Dispatch Vector
          </span>
        </div>
        <button
          onClick={handleResolve}
          className="text-[10px] font-black text-error hover:text-white hover:bg-error/30 bg-error/10 border border-error/30 px-2 py-0.5 rounded transition-all cursor-pointer font-mono"
        >
          RESOLVE
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Incident Summary Card */}
        <div className="flex justify-between items-start border-b border-outline-variant/10 pb-3">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-xs font-bold text-on-surface truncate">
              {displayedIncident.type}
            </h3>
            <p className="text-[10px] font-mono-data text-outline/80 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate">{displayedIncident.location}</span>
            </p>
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded text-[9px] font-bold border shrink-0",
            displayedIncident.priority === "CRITICAL"
              ? "bg-error/10 text-error border-error/20"
              : "bg-tertiary/10 text-tertiary border-tertiary/20"
          )}>
            {displayedIncident.priority}
          </span>
        </div>

        {/* AI Recommendation Panel */}
        {recommendedUnit ? (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 space-y-2.5 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                <Award className="w-4 h-4 text-primary" />
                <span>AI OPTIMAL UNIT FINDER</span>
              </div>
              {displayedIncident.aiConfidence !== undefined && (
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {(displayedIncident.aiConfidence * 100).toFixed(0)}% Conf
                </span>
              )}
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div>
                <h4 className="text-xs font-bold text-white">{recommendedUnit.name}</h4>
                <p className="text-[10px] text-white/60">
                  {recommendedUnit.type} • {recommendedUnit.distance.toFixed(1)} km away
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  ETA {recommendedUnit.eta} MIN
                </span>
                <span className="text-[8px] font-bold text-white/40 block font-mono">
                  TRAFFIC DENSE
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDispatch(
                recommendedUnit.id, 
                recommendedUnit.name, 
                recommendedUnit.eta, 
                recommendedUnit.distance
              )}
              className="w-full py-1.5 bg-primary hover:bg-[#c9d8ff] text-on-primary font-black rounded text-[10px] transition-all cursor-pointer shadow-[0_0_12px_rgba(180,197,255,0.3)] tracking-wider uppercase font-mono relative z-10"
            >
              DEPLOY RECOMMENDATION
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-[10px] text-white/50">
            No optimal responding units available.
          </div>
        )}

        {/* Proximity Grid Title */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 font-mono-data tracking-wider uppercase">
          <Compass className="w-3.5 h-3.5" />
          <span>Telemetry Proximity Grid</span>
        </div>

        {/* Resources list sorted by proximity */}
        <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
          {nearbyUnits.map((res) => {
            const isAssigned = displayedIncident.assignedResources.includes(res.id);
            const isAvailable = res.status === "Available";

            return (
              <div 
                key={res.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded border transition-all duration-200",
                  isAssigned 
                    ? "bg-primary-container/10 border-primary/30" 
                    : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center text-xs font-bold",
                    res.type.includes("POLICE") ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                  )}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">{res.name}</h4>
                    <p className="text-[9px] font-mono-data text-outline/80 mt-0.5">
                      ETA: {res.eta} min • {res.distance.toFixed(1)} km
                    </p>
                  </div>
                </div>

                {isAssigned ? (
                  <div className="flex items-center gap-1 text-[9px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-mono">
                    <Check className="w-3 h-3" /> STAGED
                  </div>
                ) : isAvailable ? (
                  <button
                    onClick={() => handleDispatch(res.id, res.name, res.eta, res.distance)}
                    className="px-2 py-1 bg-white/10 hover:bg-primary hover:text-on-primary text-white font-bold rounded text-[9px] transition-colors cursor-pointer border border-white/10 hover:border-primary font-mono"
                  >
                    DISPATCH
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[9px] text-error font-bold bg-error/10 border border-error/20 px-2 py-0.5 rounded font-mono">
                    <ShieldAlert className="w-3 h-3" /> BUSY
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
