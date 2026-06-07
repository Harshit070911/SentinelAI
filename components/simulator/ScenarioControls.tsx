"use client";

import { Play, Pause, RotateCcw, Zap, Layers, Share2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { SimulationMode } from "../../hooks/useSimulation";

interface ScenarioControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  speedMultiplier: number;
  activeMode: SimulationMode;
  onStart: (mode: SimulationMode) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  selectedTemplateId: string | null;
}

export default function ScenarioControls({
  isRunning,
  isPaused,
  speedMultiplier,
  activeMode,
  onStart,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
  selectedTemplateId
}: ScenarioControlsProps) {
  const speeds = [1, 2, 5, 10];

  return (
    <div className="glass-panel border border-white/10 rounded-xl p-5 space-y-5">
      {/* 1. Mode Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Simulation Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(["single", "chain", "cascade"] as SimulationMode[]).map((mode) => (
            <button
              key={mode}
              disabled={isRunning}
              onClick={() => onStart(mode)}
              className={cn(
                "py-2 px-3 rounded-lg border text-xs font-bold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer",
                activeMode === mode && !isRunning
                  ? "bg-primary/20 border-primary text-white"
                  : isRunning && activeMode === mode
                  ? "bg-primary/10 border-primary/20 text-white/80"
                  : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              {mode === "single" ? (
                <Zap className="w-4 h-4 text-amber-400" />
              ) : mode === "chain" ? (
                <Layers className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-indigo-400" />
              )}
              <span className="capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Playback Controllers */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Playback Controls</label>
        <div className="flex gap-3">
          {!isRunning ? (
            <button
              disabled={!selectedTemplateId}
              onClick={() => onStart(activeMode)}
              className={cn(
                "flex-1 py-3 rounded-lg bg-primary hover:bg-primary/80 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 border border-primary/20 cursor-pointer",
                !selectedTemplateId && "opacity-50 cursor-not-allowed"
              )}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 border border-emerald-500/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="flex-1 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 border border-amber-500/20 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={onReset}
                className="py-3 px-4 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Speed Multipliers */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Simulation Speed</label>
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-lg">
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-black font-mono transition-all duration-300 cursor-pointer",
                speedMultiplier === speed
                  ? "bg-primary text-white shadow-md border border-white/10"
                  : "text-white/40 hover:text-white"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
