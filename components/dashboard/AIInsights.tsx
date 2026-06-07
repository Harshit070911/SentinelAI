"use client";

import { useState } from "react";
import { Brain, AlertTriangle, TrendingUp, Users, Check, X } from "lucide-react";
import { useSentinelStore } from "../../store/useSentinelStore";
import { IncidentService } from "../../services/incident.service";

export default function AIInsights() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);

  // Check if Substation Breach INC-8493 is still unassigned and Unit 402 is available
  const targetIncident = incidents.find((i) => i.id === "INC-8493");
  const targetUnit = resources.find((r) => r.id === "U-402");

  const isDispatchable = 
    targetIncident && 
    targetIncident.status === "Unverified" && 
    targetUnit && 
    targetUnit.status === "Available";

  const [executed, setExecuted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleExecute = async () => {
    if (isDispatchable) {
      // Dispatch Unit 402 to incident INC-8493
      await IncidentService.dispatchUnit("INC-8493", "U-402");
      // Change status of incident to Dispatching
      await IncidentService.updateIncidentStatus("INC-8493", "Dispatching");
      setExecuted(true);
    }
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col h-full border border-tertiary/20 shadow-[0_0_30px_rgba(255,185,95,0.02)]">
      {/* Header */}
      <div className="p-4.5 border-b border-outline-variant/20 flex justify-between items-center bg-gradient-to-r from-tertiary/10 to-transparent">
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-tertiary" />
          <h3 className="text-sm font-bold text-on-surface">AI Copilot Insights</h3>
        </div>
        <span className="text-[9px] font-bold font-mono-data text-tertiary uppercase tracking-widest bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20 animate-pulse">
          Live Analysis
        </span>
      </div>

      {/* Insight Items */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <p className="text-xs text-on-surface-variant/70">
          Analyzing telemetry load, traffic vectors, and historical queues...
        </p>

        {/* Insight Item 1: Dynamic Action Card */}
        {!dismissed && (
          <div className="bg-surface-container/60 rounded-lg p-4 border border-error/30 relative overflow-hidden group transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
            
            <div className="flex items-start gap-3 pl-1">
              <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-on-surface mb-1">
                  Dispatch Patrol Unit 402 to Substation
                </h4>
                <p className="text-xs text-on-surface-variant/85 leading-snug mb-3">
                  Breach incident #INC-8493 requires patrol verification. Unit 402 is closest idle patrol unit. ETA: 3.2m.
                </p>
                
                {executed ? (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded w-fit border border-primary/20">
                    <Check className="w-4 h-4" /> Dispatch Transmitted
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExecute}
                      disabled={!isDispatchable}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 ${
                        isDispatchable 
                          ? "bg-error hover:bg-error/90 text-on-error cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                          : "bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed"
                      }`}
                    >
                      Execute Dispatch
                    </button>
                    <button 
                      onClick={() => setDismissed(true)}
                      className="border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insight Item 2: Warning Card */}
        <div className="bg-surface-container/60 rounded-lg p-4 border border-tertiary/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
          <div className="flex items-start gap-3 pl-1">
            <TrendingUp className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-on-surface mb-1">
                Congestion Vector: NH-48 Expressway
              </h4>
              <p className="text-xs text-on-surface-variant/85 leading-snug mb-2">
                Heavy waterlogging risk near Sector 14 will delay responding Medic fleets. Recommended re-routing path configured in Live Map.
              </p>
              <span className="text-[10px] text-tertiary font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                Inspect Suggested Route &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Insight Item 3: Information Card */}
        <div className="bg-surface-container/60 rounded-lg p-4 border border-primary/20 relative mt-auto">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div className="flex items-start gap-3 pl-1">
            <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-on-surface mb-1">
                Alpha Node Coverage Breaker
              </h4>
              <p className="text-xs text-on-surface-variant/85 leading-snug">
                Shift handover briefing completed at 14:00 UTC. 85% overlap coverage maintains uninterrupted telemetry sync.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
