import { scenarioEngine, SimulationStats, SimulationMode } from "../simulator/scenarioEngine";

export const SimulatorService = {
  async startSimulation(templateId: string, mode: SimulationMode = "single") {
    await scenarioEngine.startScenario(templateId, mode);
  },

  pauseSimulation() {
    scenarioEngine.pause();
  },

  resumeSimulation() {
    scenarioEngine.resume();
  },

  async resetSimulation() {
    await scenarioEngine.resetSystem();
  },

  setSimulationSpeed(speed: number) {
    scenarioEngine.setSpeed(speed);
  },

  getStats(): SimulationStats {
    return scenarioEngine.stats;
  },

  getSimulatedTime(): number {
    return scenarioEngine.simulatedTime;
  },

  getIsRunning(): boolean {
    return scenarioEngine.isRunning;
  },

  getIsPaused(): boolean {
    return scenarioEngine.isPaused;
  },

  getCurrentTemplate() {
    return scenarioEngine.currentTemplate;
  },

  getSpeedMultiplier(): number {
    return scenarioEngine.speedMultiplier;
  },

  getTriggeredMilestoneIndices(): Set<string> {
    return scenarioEngine.triggeredMilestoneIndices;
  },

  getActiveMode(): SimulationMode {
    return scenarioEngine.activeMode;
  }
};
export type { SimulationStats, SimulationMode };
