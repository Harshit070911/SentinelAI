"use client";

import { useSentinelStore } from "../../store/useSentinelStore";
import { IncidentService } from "../../services/incident.service";
import { X, Calendar, MapPin, AlertTriangle, ShieldCheck, Check, Truck } from "lucide-react";
import { INCIDENT_PRIORITIES } from "../../lib/constants";
import { formatTime } from "../../lib/helpers";
import { cn } from "../../lib/utils";

export default function IncidentModal() {
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);
  
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);

  const inc = incidents.find((i) => i.id === selectedIncidentId);

  if (!inc) return null;

  const priorityConfig = INCIDENT_PRIORITIES[inc.priority];
  const isResolved = inc.status === "Resolved";

  // Dispatch units list
  const assignedUnits = resources.filter((res) => inc.assignedResources.includes(res.id));
  const availableUnits = resources.filter((res) => res.status === "Available");

  const handleDispatch = async (unitId: string) => {
    await IncidentService.dispatchUnit(inc.id, unitId);
    if (inc.status === "Unverified") {
      await IncidentService.updateIncidentStatus(inc.id, "Dispatching");
    }
  };

  const handleRelease = async (unitId: string) => {
    await IncidentService.releaseUnit(inc.id, unitId);
  };

  const handleResolve = async () => {
    await IncidentService.resolveIncident(inc.id);
  };

  const handleStatusChange = async (newStatus: typeof inc.status) => {
    await IncidentService.updateIncidentStatus(inc.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
      <div className="glass-modal rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              #{inc.id}
            </span>
            <span className={cn(
              "text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border",
              priorityConfig.badge
            )}>
              {inc.priority}
            </span>
          </div>
          <button 
            onClick={() => setSelectedIncidentId(null)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Details */}
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-2">{inc.type}</h2>
            <div className="flex flex-wrap gap-4 text-xs font-mono-data text-outline/80 mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-outline/60" /> {inc.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-outline/60" /> {formatTime(inc.timestamp)}
              </span>
            </div>
            <div className="bg-surface-container-lowest/50 border border-outline-variant/10 rounded-lg p-4 text-sm leading-relaxed text-on-surface-variant/90 font-sans">
              {inc.description}
            </div>
          </div>

          {/* Quick Actions (Change Status, Resolve) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/30 border border-outline-variant/10 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant">Update Status:</span>
              <div className="flex gap-1">
                {(["Unverified", "Dispatching", "On Scene"] as const).map((st) => (
                  <button
                    key={st}
                    disabled={isResolved}
                    onClick={() => handleStatusChange(st)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                      inc.status === st 
                        ? "bg-primary-container/20 text-primary border border-primary/30"
                        : "bg-surface-container-high/60 text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-highest border border-transparent",
                      isResolved && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {!isResolved ? (
              <button
                onClick={handleResolve}
                className="px-4 py-1.5 bg-error hover:bg-error/95 text-on-error text-xs font-bold rounded cursor-pointer transition-colors"
              >
                RESOLVE INCIDENT
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded">
                <ShieldCheck className="w-4 h-4" /> Incident Resolved
              </div>
            )}
          </div>

          {/* Staged & Dispatch Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Assigned Units */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Assigned Resources ({assignedUnits.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {assignedUnits.length === 0 ? (
                  <div className="text-xs text-on-surface-variant/50 italic py-4 text-center border border-dashed border-outline-variant/15 rounded-lg">
                    No active resources assigned.
                  </div>
                ) : (
                  assignedUnits.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-2.5 rounded border border-primary/20 bg-primary-container/5">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs font-bold text-on-surface">{res.name}</p>
                          <p className="text-[10px] text-outline/80 font-mono-data">{res.location}</p>
                        </div>
                      </div>
                      <button
                        disabled={isResolved}
                        onClick={() => handleRelease(res.id)}
                        className={cn(
                          "text-[10px] font-bold text-error bg-error/5 hover:bg-error/15 border border-error/20 px-2 py-0.75 rounded transition-all cursor-pointer",
                          isResolved && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        RELEASE
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Units for Dispatch */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Available to Dispatch ({availableUnits.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {availableUnits.length === 0 ? (
                  <div className="text-xs text-on-surface-variant/50 italic py-4 text-center border border-dashed border-outline-variant/15 rounded-lg">
                    All units currently dispatched.
                  </div>
                ) : (
                  availableUnits.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-2.5 rounded border border-outline-variant/10 bg-surface-container/40">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-outline" />
                        <div>
                          <p className="text-xs font-bold text-on-surface">{res.name}</p>
                          <p className="text-[10px] text-outline/80 font-mono-data">{res.type} • {res.location.split(",")[0]}</p>
                        </div>
                      </div>
                      <button
                        disabled={isResolved}
                        onClick={() => handleDispatch(res.id)}
                        className={cn(
                          "text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 px-2 py-0.75 rounded transition-all cursor-pointer shadow-[0_0_6px_rgba(180,197,255,0.15)]",
                          isResolved && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        DISPATCH
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
