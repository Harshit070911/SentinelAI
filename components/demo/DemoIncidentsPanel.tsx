"use client";

import { useSentinelStore } from "@/store/useSentinelStore";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clock, Shield } from "lucide-react";

export default function DemoIncidentsPanel() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const demoMode = useSentinelStore((state) => state.demoMode);

  // Sort by newest timestamp first
  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-xl">
      <div className={cn("p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50", demoMode && "p-6")}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-error animate-pulse" />
          <h3 className={cn("text-xs font-black uppercase tracking-wider text-white", demoMode && "text-sm")}>
            Active Incidents Ledger
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">
          {incidents.filter(i => i.status !== "Resolved").length} Active
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={cn("border-b border-outline-variant/15 text-[10px] font-bold text-on-surface-variant bg-surface-container-highest/25 uppercase tracking-wider", demoMode && "text-xs")}>
              <th className="px-4 py-2.5 font-semibold">Incident Type</th>
              <th className="px-4 py-2.5 font-semibold">Location</th>
              <th className="px-4 py-2.5 font-semibold">Severity</th>
              <th className="px-4 py-2.5 font-semibold">Priority</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">AI Summary</th>
              <th className="px-4 py-2.5 font-semibold">Assigned Unit</th>
              <th className="px-4 py-2.5 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className={cn("text-xs text-on-surface divide-y divide-outline-variant/10", demoMode && "text-sm")}>
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant/60">
                  No incidents logged. Running seeder to inject scenarios.
                </td>
              </tr>
            ) : (
              sortedIncidents.map((inc) => {
                const isCritical = inc.priority === "CRITICAL";
                const isHigh = inc.priority === "HIGH";
                const isMedium = inc.priority === "MEDIUM";
                const isLow = inc.priority === "LOW";

                const resolved = inc.status === "Resolved";

                // Resolve unit name
                const unitId = inc.assignedResources[0];
                const resUnit = resources.find((r) => r.id === unitId);
                const unitName = resUnit ? resUnit.name : null;

                return (
                  <tr
                    key={inc.id}
                    className={cn(
                      "hover:bg-white/5 transition-colors duration-200",
                      isCritical && !resolved && "bg-error-container/[0.03] hover:bg-error-container/[0.06]"
                    )}
                  >
                    {/* Incident Type */}
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {inc.type}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-white/95 font-mono">
                      {inc.location.split(",")[0]}
                    </td>

                    {/* Severity Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                          isCritical
                            ? "bg-error/15 text-error border-error/25 animate-pulse"
                            : isHigh
                            ? "bg-tertiary/15 text-tertiary border-tertiary/25"
                            : isMedium
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}
                      >
                        {inc.priority}
                      </span>
                    </td>

                    {/* Priority Score */}
                    <td className="px-4 py-3 font-mono font-bold text-white/80">
                      {inc.priorityScore ? `${Math.round(inc.priorityScore)}/100` : "--"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            inc.status === "On Scene"
                              ? "bg-error animate-ping"
                              : inc.status === "Dispatching"
                              ? "bg-tertiary animate-pulse"
                              : inc.status === "Resolved"
                              ? "bg-emerald-500"
                              : "bg-amber-400"
                          )}
                        />
                        <span className="font-semibold text-white/90">
                          {inc.status}
                        </span>
                      </div>
                    </td>

                    {/* AI Summary */}
                    <td className="px-4 py-3 max-w-[200px] truncate text-on-surface-variant/90 leading-snug">
                      {inc.aiSummary || inc.description}
                    </td>

                    {/* Assigned Unit */}
                    <td className="px-4 py-3 whitespace-nowrap text-primary font-medium">
                      {unitName ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{unitName}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">None</span>
                      )}
                    </td>

                    {/* Created Time */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-white/60">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>{formatTime(inc.timestamp)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
