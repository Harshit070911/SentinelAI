import { supabase } from "../supabase/client";
import { SCENARIO_TEMPLATES, ScenarioTemplate, ScenarioStep } from "./scenarioTemplates";
import { generateIncidentPayload } from "./generateIncident";
import { generateSimulationMilestones, SimulationMilestone } from "./timelineGenerator";
import { Dispatcher, DispatchedUnitState } from "./dispatcher";
import { MapService } from "../services/map.service";

export interface SimulationStats {
  responseTimeSec: number;
  resolutionTimeSec: number;
  resourcesUsedCount: number;
  averageConfidence: number;
  totalPeopleAffected: number;
}

export type SimulationMode = "single" | "chain" | "cascade";

export class ScenarioEngine {
  public isRunning = false;
  public isPaused = false;
  public currentTemplate: ScenarioTemplate | null = null;
  public simulatedTime = 0; // elapsed simulated seconds
  public speedMultiplier = 1; // 1x, 2x, 5x, 10x
  public activeMode: SimulationMode = "single";

  // Simulation State
  public activeIncidentIds: string[] = [];
  public dispatchedUnits: DispatchedUnitState[] = [];
  public triggeredStepIndices = new Set<number>();
  public triggeredMilestoneIndices = new Set<string>(); // incidentId-milestoneStage
  public createdAlertIds: string[] = [];
  public stats: SimulationStats = {
    responseTimeSec: 10,
    resolutionTimeSec: 60,
    resourcesUsedCount: 0,
    averageConfidence: 95,
    totalPeopleAffected: 0,
  };

  private intervalId: any = null;
  private onTickCallback: (() => void) | null = null;

  // Base coordinates mapping for reset operation
  private baseResources = [
    { id: "7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a", name: "Security Team A", resource_type: "POLICE", latitude: 28.4580, longitude: 77.0700, status: "available" },
    { id: "40240240-2402-4024-0240-240240240240", name: "Police Unit A", resource_type: "POLICE", latitude: 28.4600, longitude: 77.0580, status: "available" },
    { id: "00000000-0000-0000-0000-000000000004", name: "Ambulance A", resource_type: "MEDICAL", latitude: 28.4680, longitude: 77.0390, status: "available" },
    { id: "00000000-0000-0000-0000-000000000012", name: "Fire Unit A", resource_type: "FIRE", latitude: 28.4480, longitude: 77.0210, status: "available" },
    { id: "00000000-0000-0000-0000-000000000009", name: "Ambulance B", resource_type: "MEDICAL", latitude: 28.4320, longitude: 77.0050, status: "available" }
  ];

  constructor() {}

  public registerOnTick(cb: () => void) {
    this.onTickCallback = cb;
  }

  /**
   * Resets all resources and removes all simulated incidents/alerts.
   */
  public async resetSystem() {
    this.stopTicker();
    this.isRunning = false;
    this.isPaused = false;
    this.simulatedTime = 0;
    this.activeIncidentIds = [];
    this.dispatchedUnits = [];
    this.triggeredStepIndices.clear();
    this.triggeredMilestoneIndices.clear();
    this.createdAlertIds = [];
    this.stats = {
      responseTimeSec: 0,
      resolutionTimeSec: 0,
      resourcesUsedCount: 0,
      averageConfidence: 0,
      totalPeopleAffected: 0
    };

    try {
      // 1. Delete simulated incidents (those reported by 'Simulated Sensor Core')
      const { error: incError } = await supabase
        .from("incidents")
        .delete()
        .eq("reported_by", "Simulated Sensor Core");

      if (incError) console.error("Error clearing incidents:", incError);

      // 2. Delete all alerts containing 'AI Alert' or 'Evacuation'
      const { error: alertError } = await supabase
        .from("alerts")
        .delete()
        .like("title", "%Simulated%")
        .like("title", "%AI Alert%");
      
      const { error: alertError2 } = await supabase
        .from("alerts")
        .delete()
        .like("title", "%Evacuation%");

      // 3. Restore resources to their starting bases
      for (const res of this.baseResources) {
        await supabase
          .from("resources")
          .update({
            latitude: res.latitude,
            longitude: res.longitude,
            status: "available",
            availability: true
          })
          .eq("id", res.id);
      }
    } catch (err) {
      console.error("System reset failed:", err);
    }

    if (this.onTickCallback) this.onTickCallback();
  }

  /**
   * Starts a scenario simulation.
   */
  public async startScenario(templateId: string, mode: SimulationMode = "single") {
    await this.resetSystem();
    const template = SCENARIO_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    this.currentTemplate = template;
    this.activeMode = mode;
    this.isRunning = true;
    this.isPaused = false;
    this.simulatedTime = 0;

    // Trigger step 0 immediately
    await this.triggerStep(0);

    this.startTicker();
  }

  public pause() {
    if (!this.isRunning) return;
    this.isPaused = true;
    this.stopTicker();
    if (this.onTickCallback) this.onTickCallback();
  }

  public resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.startTicker();
  }

  public setSpeed(speed: number) {
    this.speedMultiplier = speed;
    if (this.isRunning && !this.isPaused) {
      this.stopTicker();
      this.startTicker();
    }
  }

  private startTicker() {
    const tickIntervalMs = 1000 / this.speedMultiplier;
    this.intervalId = setInterval(() => {
      this.tick();
    }, tickIntervalMs);
  }

  private stopTicker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick() {
    if (!this.isRunning || this.isPaused) return;

    this.simulatedTime += 1;

    // Check Scenario template steps
    if (this.currentTemplate) {
      for (let i = 0; i < this.currentTemplate.steps.length; i++) {
        const step = this.currentTemplate.steps[i];
        
        // Single mode ignores cascade steps (steps after index 0)
        if (this.activeMode === "single" && i > 0) continue;
        
        if (this.simulatedTime >= step.timeOffset && !this.triggeredStepIndices.has(i)) {
          this.triggeredStepIndices.add(i);
          await this.triggerStep(i);
        }
      }
    }

    // Update active dispatches and resource positions
    await this.updateDispatchedUnits();

    // Trigger UI updates
    if (this.onTickCallback) this.onTickCallback();
  }

  private async triggerStep(index: number) {
    if (!this.currentTemplate) return;
    const step = this.currentTemplate.steps[index];

    if (step.type === "incident") {
      // 1. Insert incident into Supabase
      const payload = generateIncidentPayload(step);
      const { data: incident, error } = await supabase
        .from("incidents")
        .insert([payload])
        .select()
        .single();

      if (error || !incident) {
        console.error("Failed to insert simulated incident:", error);
        return;
      }

      this.activeIncidentIds.push(incident.id);

      // Log milestone T+0: Incident Created
      await this.logSimulatedEvent(incident.id, "created", `T+0 Incident Created: ${step.title}`);

      // Trigger AI Classification at T+5 relative to incident creation
      const startSimTime = this.simulatedTime;
      
      // Schedule milestones relative to incident creation
      this.scheduleMilestone(incident.id, "classified", startSimTime + 5, async () => {
        await supabase
          .from("incidents")
          .update({
            status: "pending",
            priority_score: step.severity === "critical" ? 98 : step.severity === "high" ? 82 : 48,
            ai_confidence: 0.96
          })
          .eq("id", incident.id);
        
        await this.logSimulatedEvent(incident.id, "classified", `T+5 AI Classification completed. Confidence 96%.`);
        
        this.stats.averageConfidence = 96;
      });

      // Trigger Resource Dispatch at T+10
      this.scheduleMilestone(incident.id, "dispatched", startSimTime + 10, async () => {
        const resource = await Dispatcher.findClosestResource(
          [incident.latitude, incident.longitude],
          step.recommendedResource || "POLICE"
        );

        if (resource) {
          // Assign resource in DB
          await supabase
            .from("incidents")
            .update({
              assigned_resource: resource.id,
              status: "dispatched",
              assigned_at: new Date().toISOString()
            })
            .eq("id", incident.id);

          // Update resource status to busy
          await supabase
            .from("resources")
            .update({
              status: "busy",
              availability: false
            })
            .eq("id", resource.id);

          // Log event
          await this.logSimulatedEvent(
            incident.id,
            "dispatched",
            `T+10 Resource Assigned: ${resource.name} dispatched to scene.`
          );

          // Track dispatch state for spatial movement interpolation
          this.dispatchedUnits.push({
            resourceId: resource.id,
            incidentId: incident.id,
            startCoords: [resource.latitude, resource.longitude],
            targetCoords: [incident.latitude, incident.longitude],
            startTime: this.simulatedTime,
            duration: 50, // moves from T+10 to T+60 (50 seconds)
            completed: false
          });

          this.stats.resourcesUsedCount += 1;
          this.stats.responseTimeSec = 10;
        } else {
          console.warn("No resources available for simulated dispatch!");
        }
      });

      // Trigger Alert at T+20
      this.scheduleMilestone(incident.id, "alert", startSimTime + 20, async () => {
        const { data: alert, error } = await supabase
          .from("alerts")
          .insert([
            {
              title: `AI Alert: ${step.incidentType} - Simulated`,
              message: `Safety warning generated by simulator for ${step.title}. Evacuate path vectors.`,
              severity: step.severity === "critical" ? "critical" : "severe"
            }
          ])
          .select()
          .single();

        if (!error && alert) {
          this.createdAlertIds.push(alert.id);
        }

        await this.logSimulatedEvent(incident.id, "alert", `T+20 Safety warning broadcasted.`);
      });

      // Trigger Resolution at T+60
      this.scheduleMilestone(incident.id, "resolved", startSimTime + 60, async () => {
        // Fetch assigned resource before resolving
        const { data: currentInc } = await supabase
          .from("incidents")
          .select("assigned_resource")
          .eq("id", incident.id)
          .single();

        const resId = currentInc?.assigned_resource;

        // Resolve incident
        await supabase
          .from("incidents")
          .update({
            status: "resolved",
            assigned_resource: null,
            resolved_at: new Date().toISOString()
          })
          .eq("id", incident.id);

        if (resId) {
          // Release resource
          await supabase
            .from("resources")
            .update({
              status: "available",
              availability: true
            })
            .eq("id", resId);
        }

        await this.logSimulatedEvent(incident.id, "resolved", `T+60 Incident Resolved: Scene cleared.`);

        this.stats.resolutionTimeSec = 60;
        this.stats.totalPeopleAffected += step.peopleAffected || 0;
      });
    } else if (step.type === "alert") {
      // Global scenario alert insertion
      await supabase
        .from("alerts")
        .insert([
          {
            title: `${step.title} (Simulated)`,
            message: step.description,
            severity: step.severity === "critical" ? "critical" : "severe"
          }
        ]);
    }
  }

  private scheduleMilestone(incidentId: string, stage: string, triggerTime: number, callback: () => Promise<void>) {
    const checkInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(checkInterval);
        return;
      }
      if (this.isPaused) return; // wait

      if (this.simulatedTime >= triggerTime) {
        clearInterval(checkInterval);
        const key = `${incidentId}-${stage}`;
        if (!this.triggeredMilestoneIndices.has(key)) {
          this.triggeredMilestoneIndices.add(key);
          await callback();
          if (this.onTickCallback) this.onTickCallback();
        }
      }
    }, 200);
  }

  private async logSimulatedEvent(incidentId: string, stage: string, description: string) {
    await supabase
      .from("incident_events")
      .insert([
        {
          incident_id: incidentId,
          event_type: `Simulator Milestone: ${stage}`,
          description
        }
      ]);
  }

  private async updateDispatchedUnits() {
    for (const unit of this.dispatchedUnits) {
      if (unit.completed) continue;

      const elapsed = this.simulatedTime - unit.startTime;
      const progress = Math.min(1, elapsed / unit.duration);

      // Interpolate spatial coordinates
      const currentCoords = Dispatcher.interpolateCoords(unit.startCoords, unit.targetCoords, progress);

      // Save position to resources table in Supabase
      const { error } = await supabase
        .from("resources")
        .update({
          latitude: currentCoords[0],
          longitude: currentCoords[1]
        })
        .eq("id", unit.resourceId);

      if (error) {
        console.error(`Failed to update coordinates for resource ${unit.resourceId}:`, error);
      }

      if (progress >= 1) {
        unit.completed = true;
      }
    }
  }
}
export const scenarioEngine = new ScenarioEngine();
