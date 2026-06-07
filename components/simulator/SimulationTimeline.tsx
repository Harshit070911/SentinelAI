"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { generateSimulationMilestones } from "../../simulator/timelineGenerator";
import { cn } from "../../lib/utils";

interface SimulationTimelineProps {
  simulatedTime: number;
  incidentType: string;
  resourceName: string;
  isRunning: boolean;
}

export default function SimulationTimeline({
  simulatedTime,
  incidentType,
  resourceName,
  isRunning
}: SimulationTimelineProps) {
  const milestones = generateSimulationMilestones(incidentType || "Emergency", resourceName || "Response Unit");

  return (
    <div className="glass-panel border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="font-bold text-sm text-white">Scenario Progress</h3>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
          <Clock className="w-3.5 h-3.5" />
          <span>T+{simulatedTime}s</span>
        </div>
      </div>

      {!isRunning ? (
        <div className="py-8 text-center flex flex-col items-center justify-center gap-3 text-white/40">
          <AlertCircle className="w-8 h-8 text-white/20" />
          <p className="text-xs font-mono">Start a simulation to see event milestones.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6">
          {/* Vertical line indicator */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />

          {milestones.map((milestone, idx) => {
            const isCompleted = simulatedTime >= milestone.timeOffset;
            const isActive = isRunning && simulatedTime >= milestone.timeOffset - 3 && simulatedTime < milestone.timeOffset;
            
            // Calculate progress percentage inside milestone segment
            let progress = 0;
            if (idx === 0) {
              progress = isCompleted ? 100 : 0;
            } else {
              const prevOffset = milestones[idx - 1].timeOffset;
              const duration = milestone.timeOffset - prevOffset;
              const elapsedSincePrev = simulatedTime - prevOffset;
              progress = Math.min(100, Math.max(0, (elapsedSincePrev / duration) * 100));
            }

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={milestone.label}
                className="relative flex flex-col gap-1"
              >
                {/* Node indicator */}
                <div className={cn(
                  "absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
                  isCompleted
                    ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    : isActive
                    ? "bg-primary border-primary animate-ping"
                    : "bg-[#0E0E10] border-white/20"
                )} />

                {/* Alternate static active indicator */}
                {isActive && (
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 bg-primary border-primary z-10" />
                )}

                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-bold font-mono transition-colors duration-300",
                    isCompleted ? "text-emerald-400" : isActive ? "text-primary" : "text-white/50"
                  )}>
                    {milestone.label}
                  </span>
                  
                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                <p className="text-[11px] text-white/70 leading-snug">
                  {milestone.description}
                </p>

                {/* Milestone progress bar */}
                {isRunning && !isCompleted && progress > 0 && (
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5 border border-white/5">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
