"use client";

import { useSentinelStore } from "@/store/useSentinelStore";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Truck, Bell } from "lucide-react";

export default function ContextPanel() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const alerts = useSentinelStore((state) => state.alerts);

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
  const criticalCount = activeIncidents.filter((i) => i.priority === "CRITICAL").length;
  const availableResources = resources.filter((r) => r.status === "Available");
  const dispatchedResources = resources.filter((r) => r.status === "Dispatched");
  const activeAlerts = alerts.filter((a) => a.broadcasted);

  return (
    <aside className="hidden xl:flex w-80 border-l border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/30 select-none">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> System Context
        </h2>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/15 text-center">
            <div className="text-xl font-black text-on-surface font-mono">{activeIncidents.length}</div>
            <div className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Active Incidents</div>
          </div>
          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/15 text-center">
            <div className={cn("text-xl font-black font-mono", criticalCount > 0 ? "text-error" : "text-primary")}>
              {criticalCount}
            </div>
            <div className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Critical</div>
          </div>
          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/15 text-center">
            <div className="text-xl font-black text-primary font-mono">{availableResources.length}</div>
            <div className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Available Units</div>
          </div>
          <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/15 text-center">
            <div className="text-xl font-black text-tertiary font-mono">{dispatchedResources.length}</div>
            <div className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Dispatched</div>
          </div>
        </div>

        {/* Active Incidents List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-error" /> Live Incidents
          </h3>
          {activeIncidents.length === 0 ? (
            <p className="text-xs text-on-surface-variant/50 italic px-1">All grids clear.</p>
          ) : (
            activeIncidents.slice(0, 6).map((inc) => (
              <div
                key={inc.id}
                className={cn(
                  "bg-surface-container p-2.5 rounded-lg border relative overflow-hidden",
                  inc.priority === "CRITICAL" ? "border-error/25" : "border-outline-variant/15"
                )}
              >
                <div className="absolute top-0 left-0 w-0.5 h-full bg-error" />
                <div className="flex justify-between items-start mb-1 pl-1.5">
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider",
                      inc.priority === "CRITICAL" ? "text-error" : "text-tertiary"
                    )}
                  >
                    {inc.priority}
                  </span>
                  <span className="text-[8px] font-mono-data text-outline/60">{inc.status}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant/90 leading-snug pl-1.5">
                  {inc.type} — {inc.location.split(",")[0]}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Resources Summary */}
        <div className="space-y-3 pt-3 border-t border-outline-variant/10">
          <h3 className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-primary" /> Response Units
          </h3>
          {resources.slice(0, 5).map((res) => (
            <div key={res.id} className="flex items-center justify-between text-xs px-1">
              <span className="text-on-surface-variant/80 truncate flex-1">{res.name}</span>
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded",
                  res.status === "Available"
                    ? "text-primary bg-primary/10"
                    : res.status === "Dispatched"
                    ? "text-error bg-error/10"
                    : "text-outline bg-surface-container"
                )}
              >
                {res.status}
              </span>
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <div className="space-y-3 pt-3 border-t border-outline-variant/10">
          <h3 className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5">
            <Bell className="w-3 h-3 text-error" /> Broadcasts
          </h3>
          {activeAlerts.length === 0 ? (
            <p className="text-xs text-on-surface-variant/50 italic px-1">No active broadcasts.</p>
          ) : (
            activeAlerts.slice(0, 4).map((al) => (
              <div key={al.id} className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/15">
                <h4 className="text-[11px] font-bold text-on-surface">{al.title}</h4>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5 leading-snug line-clamp-2">
                  {al.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
