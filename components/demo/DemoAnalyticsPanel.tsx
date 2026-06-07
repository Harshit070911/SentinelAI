"use client";

import { useSentinelStore } from "@/store/useSentinelStore";
import { useSimulation } from "@/hooks/useSimulation";
import { cn } from "@/lib/utils";
import { BarChart3, AlertOctagon, Shield, Clock, ShieldCheck } from "lucide-react";

export default function DemoAnalyticsPanel() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const demoMode = useSentinelStore((state) => state.demoMode);
  
  // Extract stats from running simulation
  const { stats: simStats, isRunning } = useSimulation();

  // Compute stats dynamically from the actual incidents list
  const activeIncidents = incidents.filter(i => i.status !== "Resolved");
  const activeCount = activeIncidents.length;
  const criticalCount = activeIncidents.filter(i => i.priority === "CRITICAL").length;

  const availableCount = resources.filter(r => r.status === "Available").length;
  const busyCount = resources.filter(r => r.status === "Dispatched" || r.status === "Staged").length;

  // Average response ETA
  const avgResponse = isRunning ? simStats.responseTimeSec : 10;
  const avgResolution = isRunning ? simStats.resolutionTimeSec : 60;
  const aiConf = isRunning ? simStats.averageConfidence : 95;

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-xl font-sans">
      <div className={cn("p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50", demoMode && "p-6")}>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-tertiary" />
          <h3 className={cn("text-xs font-black uppercase tracking-wider text-white", demoMode && "text-sm")}>
            Tactical Performance Analytics
          </h3>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4 flex-1">
        {/* Metric 1 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-error" /> Active Vectors
          </span>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white leading-none">{activeCount}</span>
            <span className="text-[9px] text-error font-bold font-mono">+{criticalCount} Crit</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
            <Shield className="w-3 h-3 text-primary" /> Units Available
          </span>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 leading-none">{availableCount}</span>
            <span className="text-[9px] text-tertiary font-bold font-mono">+{busyCount} Busy</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" /> Average Response Time
          </span>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white leading-none">{avgResponse}s</span>
            <span className="text-[9px] text-emerald-400 font-bold font-mono">Optimal</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-tertiary animate-pulse" /> AI Classifier
          </span>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-tertiary leading-none">{aiConf}%</span>
            <span className="text-[9px] text-white/40 font-mono">Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
