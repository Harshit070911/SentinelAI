import { useState, useEffect } from "react";
import { SimulatorService, SimulationStats, SimulationMode } from "../services/simulator.service";
import { scenarioEngine } from "../simulator/scenarioEngine";

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentTemplate, setCurrentTemplate] = useState(SimulatorService.getCurrentTemplate());
  const [stats, setStats] = useState<SimulationStats>({
    responseTimeSec: 0,
    resolutionTimeSec: 0,
    resourcesUsedCount: 0,
    averageConfidence: 0,
    totalPeopleAffected: 0
  });
  const [triggeredMilestones, setTriggeredMilestones] = useState<Set<string>>(new Set());
  const [activeMode, setActiveMode] = useState<SimulationMode>("single");

  useEffect(() => {
    const syncState = () => {
      setIsRunning(SimulatorService.getIsRunning());
      setIsPaused(SimulatorService.getIsPaused());
      setSimulatedTime(SimulatorService.getSimulatedTime());
      setSpeedMultiplier(SimulatorService.getSpeedMultiplier());
      setCurrentTemplate(SimulatorService.getCurrentTemplate());
      setStats({ ...SimulatorService.getStats() });
      setTriggeredMilestones(new Set(SimulatorService.getTriggeredMilestoneIndices()));
      setActiveMode(SimulatorService.getActiveMode());
    };

    // Initialize state
    syncState();

    // Register tick callback
    scenarioEngine.registerOnTick(syncState);

    return () => {
      // Clear tick callback on unmount
      scenarioEngine.registerOnTick(() => {});
    };
  }, []);

  const start = async (templateId: string, mode: SimulationMode = "single") => {
    await SimulatorService.startSimulation(templateId, mode);
  };

  const pause = () => {
    SimulatorService.pauseSimulation();
  };

  const resume = () => {
    SimulatorService.resumeSimulation();
  };

  const reset = async () => {
    await SimulatorService.resetSimulation();
  };

  const setSpeed = (speed: number) => {
    SimulatorService.setSimulationSpeed(speed);
  };

  return {
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
  };
}
export type { SimulationStats, SimulationMode };
