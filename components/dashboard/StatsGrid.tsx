"use client";

import { motion } from "framer-motion";
import { AlertOctagon, ShieldAlert, Truck, Timer, TrendingUp, TrendingDown } from "lucide-react";
import { useSentinelStore } from "../../store/useSentinelStore";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

export default function StatsGrid() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const criticalIncidents = incidents.filter((i) => i.priority === "CRITICAL" && i.status !== "Resolved").length;
  
  const totalResources = resources.length;
  const availableResources = resources.filter((r) => r.status === "Available").length;
  const fleetPct = totalResources > 0 ? Math.round((availableResources / totalResources) * 100) : 0;

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* Active Incidents */}
      <motion.div variants={itemVariants} className="glass-panel p-5 rounded-xl flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-error-container/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Incidents</span>
          <AlertOctagon className="w-5 h-5 text-error" />
        </div>
        <div className="flex items-end gap-3 relative z-10 mt-auto">
          <span className="text-4xl font-black text-error font-mono-data drop-shadow-[0_0_8px_rgba(255,180,171,0.3)]">
            {String(activeIncidents).padStart(2, "0")}
          </span>
          <span className="text-xs font-semibold text-error flex items-center mb-1.5 gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> 12%
          </span>
        </div>
      </motion.div>

      {/* Critical Emergencies */}
      <motion.div 
        variants={itemVariants} 
        className={`glass-panel p-5 rounded-xl flex flex-col relative overflow-hidden transition-all duration-300 ${
          criticalIncidents > 0 ? "pulse-critical border-error/50" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${criticalIncidents > 0 ? "text-error" : "text-on-surface-variant"}`}>
            Critical Incidents
          </span>
          <ShieldAlert className={`w-5 h-5 ${criticalIncidents > 0 ? "text-error" : "text-on-surface-variant"}`} />
        </div>
        <div className="flex items-end gap-3 relative z-10 mt-auto">
          <span className={`text-4xl font-black font-mono-data ${criticalIncidents > 0 ? "text-error" : "text-on-surface"}`}>
            {String(criticalIncidents).padStart(2, "0")}
          </span>
          <span className="text-xs text-on-surface-variant/75 mb-1.5">
            {criticalIncidents > 0 ? "Requiring Action" : "Immediate Staging Ready"}
          </span>
        </div>
      </motion.div>

      {/* Available Resources */}
      <motion.div variants={itemVariants} className="glass-panel p-5 rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fleet Availability</span>
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-4xl font-black text-on-surface font-mono-data">
            {fleetPct}%
          </span>
          <span className="text-xs text-on-surface-variant/75 mb-1.5">
            {availableResources}/{totalResources} Units Free
          </span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 shadow-inner">
          <motion.div 
            className="bg-primary h-1.5 rounded-full shadow-[0_0_8px_var(--color-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${fleetPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Average Response Time */}
      <motion.div variants={itemVariants} className="glass-panel p-5 rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Avg Response Time</span>
          <Timer className="w-5 h-5 text-tertiary" />
        </div>
        <div className="flex items-end gap-3 mt-auto">
          <span className="text-4xl font-black text-on-surface font-mono-data">
            04:12
          </span>
          <span className="text-xs text-secondary flex items-center mb-1.5 gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" /> -0:15
          </span>
        </div>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">vs yesterday average of 4:27</p>
      </motion.div>
    </motion.div>
  );
}
