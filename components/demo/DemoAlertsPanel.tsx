"use client";

import { useSentinelStore } from "@/store/useSentinelStore";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { BellRing, AlertTriangle, Info, Radio } from "lucide-react";

export default function DemoAlertsPanel() {
  const alerts = useSentinelStore((state) => state.alerts);
  const demoMode = useSentinelStore((state) => state.demoMode);

  // Sort newest first
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-xl">
      <div className={cn("p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50", demoMode && "p-6")}>
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-error animate-pulse" />
          <h3 className={cn("text-xs font-black uppercase tracking-wider text-white", demoMode && "text-sm")}>
            Active Safety Alerts
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">
          {alerts.length} Broadcasted
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar max-h-[300px]">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12 text-xs text-on-surface-variant/60 font-medium">
            No active alerts broadcast.
          </div>
        ) : (
          sortedAlerts.map((alert) => {
            const isCritical = alert.severity === "CRITICAL" || alert.severity === "SEVERE";
            const isWarning = alert.severity === "WARNING";

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border bg-white/[0.01] flex items-start gap-2.5 transition-all hover:bg-white/[0.04] relative overflow-hidden",
                  isCritical ? "border-error/20" : isWarning ? "border-tertiary/20" : "border-white/5"
                )}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    isCritical ? "bg-error" : isWarning ? "bg-tertiary" : "bg-primary"
                  )}
                />

                <div
                  className={cn(
                    "p-1 rounded shrink-0",
                    isCritical
                      ? "bg-error/10 text-error animate-pulse border border-error/20"
                      : isWarning
                      ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  {isCritical ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : isWarning ? (
                    <Radio className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 font-sans">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug truncate">
                      {alert.title}
                    </h4>
                    <span className="text-[9px] font-mono text-white/40 shrink-0">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/90 leading-snug mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
