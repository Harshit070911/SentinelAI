"use client";

import { useState } from "react";
import { useSimulation } from "../../hooks/useSimulation";
import { SCENARIO_TEMPLATES } from "../../simulator/scenarioTemplates";
import ScenarioCard from "./ScenarioCard";
import ScenarioControls from "./ScenarioControls";
import SimulationTimeline from "./SimulationTimeline";
import SimulationStats from "./SimulationStats";
import { Play, RotateCcw, ShieldAlert, Award } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ScenarioPlayer() {
  const {
    isRunning,
    isPaused,
    simulatedTime,
    speedMultiplier,
    currentTemplate,
    stats,
    triggeredMilestones,
    activeMode,
    start,
    pause,
    resume,
    reset,
    setSpeed
  } = useSimulation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(SCENARIO_TEMPLATES[0].id);

  const handleStart = async (mode: any) => {
    if (selectedTemplateId) {
      await start(selectedTemplateId, mode);
    }
  };

  // Determine active incident type and unit name for timeline display
  const activeTemplate = SCENARIO_TEMPLATES.find((t) => t.id === selectedTemplateId);
  const incidentType = activeTemplate?.steps[0]?.incidentType || "Emergency";
  const recommendedResource = activeTemplate?.steps[0]?.recommendedResource || "POLICE";
  
  let resourceName = "Response Unit";
  if (recommendedResource === "FIRE") resourceName = "Engine 12 (Fire)";
  else if (recommendedResource === "MEDICAL") resourceName = "Medic 4 (Ambulance)";
  else if (recommendedResource === "POLICE") resourceName = "Unit 402 (Patrol)";
  else if (recommendedResource === "SECURITY") resourceName = "Unit 402 (Patrol)";

  return (
    <div className="space-y-6">
      {/* Top Section: Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span>Emergency Operations Simulator</span>
          </h2>
          <p className="text-xs text-white/50">
            Simulate security events, model resource dispatches, and audit AI response metrics.
          </p>
        </div>

        {isRunning && (
          <div className="flex items-center gap-3 bg-[#0E0E10]/40 border border-white/5 px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isPaused ? "bg-amber-400" : "bg-emerald-400")}></span>
              <span className={cn("relative inline-flex rounded-full h-2 w-2", isPaused ? "bg-amber-500" : "bg-emerald-500")}></span>
            </span>
            <span className="font-mono text-xs font-bold text-white uppercase">
              {isPaused ? "Simulation Paused" : `Running Sim (${speedMultiplier}x)`}
            </span>
          </div>
        )}
      </div>

      {/* Middle Section: Selector & Timeline controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Template list */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Select Scenario Template</label>
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {SCENARIO_TEMPLATES.map((template) => (
              <ScenarioCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                disabled={isRunning}
              />
            ))}
          </div>
        </div>

        {/* Col 2: Playback Settings */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Simulation Control Center</label>
          <ScenarioControls
            isRunning={isRunning}
            isPaused={isPaused}
            speedMultiplier={speedMultiplier}
            activeMode={activeMode}
            onStart={handleStart}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSpeedChange={setSpeed}
            selectedTemplateId={selectedTemplateId}
          />

          {/* AI Info Card */}
          <div className="glass-panel border border-white/10 rounded-xl p-4 flex gap-3.5 items-start">
            <div className="p-2 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-white">Closed-Loop AI Dispatch</h4>
              <p className="text-[11px] text-white/60 leading-snug">
                This simulator integrates with the Gemini 2.5 Flash classification service to model automated dispatch and public broadcasts.
              </p>
            </div>
          </div>
        </div>

        {/* Col 3: Milestones Progress */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Simulation Telemetry</label>
          <SimulationTimeline
            simulatedTime={simulatedTime}
            incidentType={incidentType}
            resourceName={resourceName}
            isRunning={isRunning}
          />
        </div>
      </div>

      {/* Bottom Section: Stats Grid */}
      <div className="space-y-3 pt-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Simulation Performance Analytics</label>
        <SimulationStats stats={stats} isRunning={isRunning} />
      </div>
    </div>
  );
}
