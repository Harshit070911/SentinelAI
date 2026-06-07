"use client";

import { motion } from "framer-motion";
import { Clock, Shield, Award, Users, AlertTriangle } from "lucide-react";
import { SimulationStats as StatsType } from "../../hooks/useSimulation";

interface SimulationStatsProps {
  stats: StatsType;
  isRunning: boolean;
}

export default function SimulationStats({ stats, isRunning }: SimulationStatsProps) {
  const items = [
    {
      label: "AI Response Time",
      value: stats.responseTimeSec ? `T+${stats.responseTimeSec}s` : "0s",
      desc: "Simulated dispatcher ETA target",
      icon: <Clock className="w-4 h-4 text-amber-400" />
    },
    {
      label: "Sim Resolution Time",
      value: stats.resolutionTimeSec ? `T+${stats.resolutionTimeSec}s` : "0s",
      desc: "Total clear and release time",
      icon: <Clock className="w-4 h-4 text-emerald-400" />
    },
    {
      label: "Resources Dispatched",
      value: stats.resourcesUsedCount,
      desc: "Units actively deployed in sim",
      icon: <Shield className="w-4 h-4 text-primary" />
    },
    {
      label: "AI Model Confidence",
      value: stats.averageConfidence ? `${stats.averageConfidence}%` : "0%",
      desc: "Gemini 2.5 Flash classification score",
      icon: <Award className="w-4 h-4 text-sky-400" />
    },
    {
      label: "Spectators Affected",
      value: stats.totalPeopleAffected,
      desc: "Estimated zone counts",
      icon: <Users className="w-4 h-4 text-indigo-400" />
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="glass-panel border border-white/10 rounded-xl p-4 flex flex-col justify-between min-h-[100px] shadow-lg"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40 leading-snug">
              {item.label}
            </span>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
              {item.icon}
            </div>
          </div>

          <div className="space-y-0.5 mt-3">
            <h3 className="text-xl font-bold font-mono text-white leading-none">
              {item.value}
            </h3>
            <p className="text-[10px] text-white/50 leading-tight">
              {item.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
