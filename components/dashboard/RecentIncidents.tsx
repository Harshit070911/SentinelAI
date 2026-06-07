"use client";

import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { useSentinelStore } from "../../store/useSentinelStore";
import { INCIDENT_PRIORITIES } from "../../lib/constants";
import { cn } from "../../lib/utils";

export default function RecentIncidents() {
  const incidents = useSentinelStore((state) => state.incidents);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);

  // Take the most recent 4 incidents for preview
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4.5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
        <div>
          <h3 className="text-base font-bold text-on-surface">Recent Incidents</h3>
          <p className="text-xs text-on-surface-variant/70">Real-time status of latest emergency logs</p>
        </div>
        <Link 
          href="/incidents" 
          className="text-xs font-semibold text-primary hover:text-primary-fixed-dim flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-outline-variant/20 text-[10px] font-bold text-on-surface-variant bg-surface-container-highest/20 uppercase tracking-wider">
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Priority</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody className="text-sm text-on-surface divide-y divide-outline-variant/10">
            {recentIncidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-xs text-on-surface-variant/60 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CircleDot className="w-8 h-8 text-outline-variant/30 animate-pulse" />
                    <span>No active incidents</span>
                  </div>
                </td>
              </tr>
            ) : (
              recentIncidents.map((inc) => {
                const priorityConfig = INCIDENT_PRIORITIES[inc.priority];
                
                // Define status colors and classes
                const statusConfig = {
                  Unverified: "text-on-surface-variant/80",
                  Dispatching: "text-tertiary font-medium",
                  "On Scene": "text-error font-bold",
                  Resolved: "text-on-surface-variant/50"
                };
                
                const isCritical = inc.priority === "CRITICAL" && inc.status !== "Resolved";

                return (
                  <tr 
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={cn(
                      "hover:bg-white/5 transition-colors group cursor-pointer",
                      isCritical ? "bg-error-container/5 hover:bg-error-container/10" : ""
                    )}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                      #{inc.id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {inc.type}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide",
                        priorityConfig.badge
                      )}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <CircleDot className={cn(
                          "w-2.5 h-2.5 fill-current",
                          inc.status === "Dispatching" && "text-tertiary animate-pulse",
                          inc.status === "On Scene" && "text-error animate-ping",
                          inc.status === "Unverified" && "text-tertiary/60",
                          inc.status === "Resolved" && "text-outline/40"
                        )} />
                        <span className={cn("text-xs", statusConfig[inc.status])}>
                          {inc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-on-surface-variant/90 font-mono">
                      {inc.location}
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
