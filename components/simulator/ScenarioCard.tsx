"use client";

import { motion } from "framer-motion";
import { ScenarioTemplate } from "../../simulator/scenarioTemplates";
import { Flame, Activity, Users, AlertTriangle, Shield, Eye, HelpCircle, HardHat } from "lucide-react";
import { cn } from "../../lib/utils";

interface ScenarioCardProps {
  template: ScenarioTemplate;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ScenarioCard({ template, isSelected, onClick, disabled }: ScenarioCardProps) {
  // Select icon based on scenario category
  const getIcon = () => {
    switch (template.category) {
      case "Fire":
        return <Flame className="w-5 h-5 text-red-400" />;
      case "Medical Emergency":
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case "Crowd Panic":
      case "Stampede":
        return <Users className="w-5 h-5 text-amber-400" />;
      case "Lost Child":
        return <HelpCircle className="w-5 h-5 text-sky-400" />;
      case "Violence":
        return <Shield className="w-5 h-5 text-indigo-400" />;
      case "Suspicious Activity":
        return <Eye className="w-5 h-5 text-purple-400" />;
      case "Infrastructure Failure":
        return <HardHat className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 cursor-pointer",
        isSelected
          ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(180,197,255,0.15)] text-white"
          : "bg-[#0E0E10]/40 border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-lg border",
        isSelected ? "bg-primary/20 border-primary/30" : "bg-white/5 border-white/5"
      )}>
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <h4 className="font-bold text-sm text-white truncate">{template.title}</h4>
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50">
            {template.category}
          </span>
        </div>
        
        <p className="text-xs text-white/60 leading-snug line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center gap-3 pt-1 text-[10px] text-white/40 font-mono">
          <span>Coords: {template.initialCoordinates.join(", ")}</span>
          <span>•</span>
          <span>Steps: {template.steps.length}</span>
        </div>
      </div>
    </motion.button>
  );
}
