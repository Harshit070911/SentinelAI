"use client";

import { useState } from "react";
import { useSentinelStore } from "@/store/useSentinelStore";
import { AlertService } from "@/services/alert.service";
import { Megaphone, AlertTriangle, Check, VolumeX, Bell } from "lucide-react";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const alerts = useSentinelStore((state) => state.alerts);

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"CRITICAL" | "SEVERE" | "WARNING" | "INFO">("WARNING");
  const [message, setMessage] = useState("");
  const [sectorInput, setSectorInput] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    setSuccess(false);

    const sectors = sectorInput ? sectorInput.split(",").map(s => s.trim()) : ["All Districts"];

    await AlertService.broadcastAlert({
      title,
      severity,
      message,
      sectors
    });

    setSubmitting(false);
    setSuccess(true);
    setTitle("");
    setMessage("");
    setSectorInput("");

    setTimeout(() => setSuccess(false), 3000);
  };

  const handleMute = async (alertId: string) => {
    await AlertService.dismissAlert(alertId);
  };

  return (
    <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 bg-background">
      {/* Left Column: Broadcast Form (5 spans) */}
      <div className="w-full lg:w-[420px] shrink-0">
        <div className="glass-panel rounded-xl p-5 border border-outline-variant/20 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Emergency Broadcast Panel</h3>
          </div>
          
          <p className="text-xs text-on-surface-variant/80 mb-5">
            Broadcast emergency alerts, evacuation directives, and critical alerts directly to field responder devices and sirens.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Alert Subject</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Hazmat Containment Spill"
                className="bg-surface-container border border-outline-variant/30 rounded-lg p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Severity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Severity Vector</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["CRITICAL", "SEVERE", "WARNING", "INFO"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={cn(
                      "py-2 rounded text-[10px] font-bold border transition-all cursor-pointer uppercase tracking-wider",
                      severity === sev
                        ? sev === "CRITICAL"
                          ? "bg-error/20 text-error border-error/40 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                          : sev === "SEVERE"
                          ? "bg-secondary-container/20 text-secondary border-secondary/40"
                          : sev === "WARNING"
                          ? "bg-tertiary/20 text-tertiary border-tertiary/40"
                          : "bg-primary/20 text-primary border-primary/40"
                        : "bg-surface-container/60 text-on-surface-variant/70 border-transparent hover:text-on-surface"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Sectors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Target Sectors</label>
              <input
                type="text"
                value={sectorInput}
                onChange={(e) => setSectorInput(e.target.value)}
                placeholder="e.g. Sector 14, DLF Phase 3 (Comma separated)"
                className="bg-surface-container border border-outline-variant/30 rounded-lg p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Message Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Broadcast Directives</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose directive broadcast instructions..."
                className="bg-surface-container border border-outline-variant/30 rounded-lg p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary resize-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.15)]",
                success 
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "bg-primary hover:bg-primary-fixed text-on-primary"
              )}
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" /> BROADCAST SENT
                </>
              ) : submitting ? (
                "TRANSMITTING..."
              ) : (
                <>
                  <Megaphone className="w-4 h-4" /> TRANSMIT BROADCAST
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: History List (Flex-1) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="glass-panel rounded-xl flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4.5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/40">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Broadcast Log History</h3>
              <p className="text-xs text-on-surface-variant/70">Trace system alarms and siren declarations</p>
            </div>
            <Bell className="w-4.5 h-4.5 text-on-surface-variant/80" />
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-on-surface-variant/60">
                No alert broadcast history found.
              </div>
            ) : (
              alerts.map((al) => {
                const isCritical = al.severity === "CRITICAL" && al.broadcasted;

                return (
                  <div 
                    key={al.id} 
                    className={cn(
                      "bg-surface-container/40 p-4 rounded-xl border flex flex-col justify-between hover:bg-surface-container/60 transition-colors relative overflow-hidden",
                      al.broadcasted 
                        ? al.severity === "CRITICAL"
                          ? "border-error/45 bg-error-container/[0.01]"
                          : al.severity === "WARNING"
                          ? "border-tertiary/40"
                          : "border-primary/40"
                        : "border-outline-variant/10 opacity-70"
                    )}
                  >
                    {/* Pulsing indicator if active broadcast */}
                    {al.broadcasted && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          isCritical ? "bg-error animate-ping" : "bg-primary animate-pulse"
                        )} />
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          al.severity === "CRITICAL" ? "text-error" : "text-primary"
                        )}>
                          Broadcasting
                        </span>
                      </div>
                    )}

                    {/* Top Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 pr-20">
                        <AlertTriangle className={cn(
                          "w-4 h-4 shrink-0",
                          al.severity === "CRITICAL" && "text-error",
                          al.severity === "SEVERE" && "text-secondary",
                          al.severity === "WARNING" && "text-tertiary",
                          al.severity === "INFO" && "text-primary"
                        )} />
                        <h4 className="text-xs font-bold text-on-surface leading-snug">{al.title}</h4>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant/90 leading-snug font-sans mb-3.5">
                        {al.message}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-outline-variant/10 text-[10px] font-mono-data text-outline/85">
                      <div className="flex flex-col gap-0.5">
                        <span>Districts: {al.sectors.join(", ")}</span>
                        <span>Logged: {formatTime(al.timestamp)}</span>
                      </div>

                      {al.broadcasted && (
                        <button
                          onClick={() => handleMute(al.id)}
                          className="text-error hover:text-error-container hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <VolumeX className="w-3.5 h-3.5" /> MUTE ALARM
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
