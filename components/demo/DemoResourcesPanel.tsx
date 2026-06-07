"use client";

import { useSentinelStore } from "@/store/useSentinelStore";
import { cn } from "@/lib/utils";
import { Shield, Zap, Flame, Heart, Compass } from "lucide-react";

export default function DemoResourcesPanel() {
  const resources = useSentinelStore((state) => state.resources);
  const incidents = useSentinelStore((state) => state.incidents);
  const demoMode = useSentinelStore((state) => state.demoMode);

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-xl">
      <div className={cn("p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50", demoMode && "p-6")}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary animate-pulse" />
          <h3 className={cn("text-xs font-black uppercase tracking-wider text-white", demoMode && "text-sm")}>
            Tactical Resource Fleet
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">
          {resources.filter(r => r.status === "Available").length} Ready
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className={cn("border-b border-outline-variant/15 text-[10px] font-bold text-on-surface-variant bg-surface-container-highest/25 uppercase tracking-wider", demoMode && "text-xs")}>
              <th className="px-4 py-2.5 font-semibold">Resource Name</th>
              <th className="px-4 py-2.5 font-semibold">Type</th>
              <th className="px-4 py-2.5 font-semibold">Availability</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">ETA</th>
              <th className="px-4 py-2.5 font-semibold">Current Assignment</th>
            </tr>
          </thead>
          <tbody className={cn("text-xs text-on-surface divide-y divide-outline-variant/10", demoMode && "text-sm")}>
            {resources.map((res) => {
              const isAvailable = res.status === "Available";
              const isBusy = res.status === "Dispatched" || res.status === "Staged";
              const isOffline = res.status === "Maintenance";

              // Find current assignment
              const activeIncident = incidents.find(
                (inc) => inc.status !== "Resolved" && inc.assignedResources.includes(res.id)
              );

              // Type icon
              const TypeIcon = res.type === "FIRE" ? Flame : res.type === "MEDICAL" ? Heart : Shield;
              const typeColor = res.type === "FIRE" ? "text-error" : res.type === "MEDICAL" ? "text-tertiary" : "text-primary";

              return (
                <tr key={res.id} className="hover:bg-white/5 transition-colors duration-200">
                  {/* Resource Name */}
                  <td className="px-4 py-3 font-semibold text-white">
                    {res.name}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <TypeIcon className={cn("w-3.5 h-3.5", typeColor)} />
                      <span className="font-medium">{res.type}</span>
                    </div>
                  </td>

                  {/* Availability */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                        isAvailable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : isBusy
                          ? "bg-tertiary/15 text-tertiary border-tertiary/25"
                          : "bg-white/5 text-white/40 border-white/10"
                      )}
                    >
                      {isAvailable ? "Available" : isBusy ? "Busy" : "Offline"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isAvailable
                            ? "bg-emerald-500"
                            : isBusy
                            ? "bg-tertiary animate-pulse"
                            : "bg-white/30"
                        )}
                      />
                      <span className="text-white/80">{res.status}</span>
                    </div>
                  </td>

                  {/* ETA */}
                  <td className="px-4 py-3 font-mono font-bold text-white/85">
                    {isBusy && activeIncident ? (
                      <span className="text-tertiary">~4.5 min</span>
                    ) : (
                      <span className="text-white/30">--</span>
                    )}
                  </td>

                  {/* Current Assignment */}
                  <td className="px-4 py-3 font-medium text-white/95">
                    {activeIncident ? (
                      <div className="flex items-center gap-1.5 text-error">
                        <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                        <span>Responding to {activeIncident.type}</span>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">Standby</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
