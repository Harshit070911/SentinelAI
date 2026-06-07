"use client";

import { useState, useEffect } from "react";
import { useSentinelStore } from "@/store/useSentinelStore";
import { useSimulation } from "@/hooks/useSimulation";
import { SCENARIO_TEMPLATES } from "@/simulator/scenarioTemplates";
import { DbSeedService } from "@/services/dbSeed.service";
import { IncidentService } from "@/services/incident.service";
import { ResourceService } from "@/services/resource.service";
import { AlertService } from "@/services/alert.service";
import LiveMap from "@/components/map/LiveMap";
import Timeline from "@/components/map/Timeline";
import DemoIncidentsPanel from "@/components/demo/DemoIncidentsPanel";
import DemoResourcesPanel from "@/components/demo/DemoResourcesPanel";
import DemoAlertsPanel from "@/components/demo/DemoAlertsPanel";
import DemoAnalyticsPanel from "@/components/demo/DemoAnalyticsPanel";
import { 
  Activity, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  Cpu, 
  Database, 
  Network, 
  Radio, 
  Tv, 
  Sparkles,
  Zap,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/helpers";

export default function DemoPage() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const alerts = useSentinelStore((state) => state.alerts);
  const realtimeConnected = useSentinelStore((state) => state.realtimeConnected);
  const supabaseStatus = useSentinelStore((state) => state.supabaseStatus);
  const demoMode = useSentinelStore((state) => state.demoMode);
  const setDemoMode = useSentinelStore((state) => state.setDemoMode);
  const addToast = useSentinelStore((state) => state.addToast);

  // Simulation controls
  const {
    isRunning,
    isPaused,
    simulatedTime,
    speedMultiplier,
    start,
    pause,
    resume,
    reset,
    setSpeed
  } = useSimulation();

  // Autoplay and scenario index states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SCENARIO_TEMPLATES[0].id);
  const [autoplay, setAutoplay] = useState(false);
  const [autoplayIndex, setAutoplayIndex] = useState(0);

  const handleQuickLaunch = async (templateId: string, label: string) => {
    try {
      addToast({
        title: `Launching ${label} Scenario`,
        description: "Seeding EOC master database and starting telemetry simulation.",
        type: "info"
      });

      // 1. Force seed EOC database (5 incidents, 5 resources, 3 alerts, 10 events)
      await DbSeedService.seedIfEmpty(true);

      // 2. Fetch fresh data into Zustand store immediately
      await Promise.all([
        IncidentService.getIncidents(),
        ResourceService.getResources(),
        AlertService.getAlerts()
      ]);

      // 3. Force timeline component to refetch events
      window.dispatchEvent(new Event("sentinel-db-seeded"));

      // 4. Start simulation with high speed (5x) for presentations
      setTimeout(() => {
        setSelectedTemplateId(templateId);
      }, 0);
      setSpeed(5);
      await start(templateId, "cascade");

      addToast({
        title: `${label} Scenario Active`,
        description: "AI dispatcher and Leaflet map vectors initialized.",
        type: "success"
      });
    } catch (err) {
      console.error("Failed to execute quick launch scenario:", err);
      addToast({
        title: "Scenario Launch Failed",
        description: "An error occurred while seeding database and starting simulation.",
        type: "error"
      });
    }
  };

  // Auto seed check on mount
  useEffect(() => {
    const autoSeedCheck = async () => {
      if (incidents.length === 0) {
        console.log("[DemoPage] No incidents found on load. Triggering backup seeder...");
        await DbSeedService.seedIfEmpty();
        await Promise.all([
          IncidentService.getIncidents(),
          ResourceService.getResources(),
          AlertService.getAlerts()
        ]);
        window.dispatchEvent(new Event("sentinel-db-seeded"));
      }
    };
    autoSeedCheck();
  }, [incidents]);

  // Autoplay simulation loop controller
  useEffect(() => {
    if (!autoplay) return;

    if (!isRunning) {
      const template = SCENARIO_TEMPLATES[autoplayIndex];
      if (template) {
        addToast({
          title: `Autoplay Scenario Initiated`,
          description: `Starting automated run of: ${template.title}`,
          type: "info"
        });
        setTimeout(() => {
          setSelectedTemplateId(template.id);
        }, 0);
        setSpeed(5); // run at 5x speed for judge presentation pace
        start(template.id, "cascade");
      }
    } else {
      // If simulatedTime exceeds resolution milestone (typically T+60), trigger next
      if (simulatedTime >= 65) {
        const nextIndex = (autoplayIndex + 1) % SCENARIO_TEMPLATES.length;
        setTimeout(() => {
          setAutoplayIndex(nextIndex);
        }, 0);
        
        // Brief pause, reset, then cycle to next
        const autoResetCycle = async () => {
          addToast({
            title: "Scenario Completed",
            description: "Resetting database state for next scenario vector.",
            type: "success"
          });
          await reset();
        };
        autoResetCycle();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, isRunning, simulatedTime, autoplayIndex]);

  // Dynamic Copilot Summary generation based on current active incidents
  const activeIncidents = incidents.filter(i => i.status !== "Resolved");
  
  let copilotSituationSummary = "Monitoring command grids. Telemetry status nominal. Ready to triage incoming emergency signals.";
  let copilotRecommendedAction = "No active threats require dispatch. Keep tactical responders staged at primary base sectors.";
  let copilotRiskLevel = "LOW";
  let copilotRiskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";

  if (activeIncidents.length > 0) {
    const listIncidents = activeIncidents.map(i => `${i.type} at ${i.location}`).join(", ");
    copilotSituationSummary = `Active threat detected: ${listIncidents}. Sensory nodes report escalated crowd risk metrics nearby.`;
    
    const requiredResources = activeIncidents.map(i => i.recommendedResourceType || "patrol units").join(" and ");
    copilotRecommendedAction = `AI advises dispatching closest ${requiredResources} immediately. Initiate audio evacuations at incident coordinates.`;

    const hasCritical = activeIncidents.some(i => i.priority === "CRITICAL");
    const hasHigh = activeIncidents.some(i => i.priority === "HIGH");

    if (hasCritical) {
      copilotRiskLevel = "CRITICAL";
      copilotRiskColor = "text-error bg-error/15 border-error/25 animate-pulse";
    } else if (hasHigh) {
      copilotRiskLevel = "HIGH";
      copilotRiskColor = "text-tertiary bg-tertiary/15 border-tertiary/25";
    } else {
      copilotRiskLevel = "MEDIUM";
      copilotRiskColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  }

  // Presentation Mode sizing styles overrides
  const presentationClass = demoMode 
    ? "text-base gap-8 md:p-8" 
    : "text-xs gap-6 md:p-6";

  return (
    <main className={cn("flex-1 p-4 overflow-y-auto bg-background transition-all duration-300 font-sans", presentationClass)}>
      {/* Custom Styles Injector for Projector Screens */}
      {demoMode && (
        <style jsx global>{`
          .glass-panel h3 { font-size: 1rem !important; }
          .glass-panel th { font-size: 0.85rem !important; padding: 12px 16px !important; }
          .glass-panel td { font-size: 0.95rem !important; padding: 16px !important; }
          .glass-panel p { font-size: 0.9rem !important; }
        `}</style>
      )}

      {/* TOP SECTION: Controls, System Health & Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Scenario Controls Card (5 columns) */}
        <div className="xl:col-span-5 glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className={cn("text-sm font-black uppercase tracking-wider text-white flex items-center gap-2", demoMode && "text-base")}>
                <ShieldAlert className="w-5 h-5 text-primary" />
                <span>Demo Operator Deck</span>
              </h2>
              <p className="text-xs text-white/50">
                Initiate simulations to model AI triage dispatches and telemetry.
              </p>
            </div>

            {/* Autoplay toggle badge */}
            <button
              onClick={() => {
                setAutoplay(!autoplay);
                addToast({
                  title: !autoplay ? "Autoplay Loop Enabled" : "Autoplay Loop Disabled",
                  description: !autoplay ? "SentinelAI will cycle through scenario templates automatically." : "Operator control restored.",
                  type: "info"
                });
              }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5",
                autoplay 
                  ? "bg-tertiary/20 text-tertiary border-tertiary animate-pulse" 
                  : "bg-white/5 text-white/40 border-white/10 hover:text-white"
              )}
            >
              <Radio className="w-3 h-3" />
              <span>{autoplay ? "Autoplay ON" : "Autoplay OFF"}</span>
            </button>
          </div>

          {/* Scenario Selector & Action buttons */}
          <div className="space-y-3">
            {/* Template Dropdown (Hidden if autoplaying to keep it clean) */}
            {!autoplay && (
              <div className="flex gap-2">
                <select
                  value={selectedTemplateId}
                  disabled={isRunning}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="flex-1 bg-surface-container border border-outline-variant/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {SCENARIO_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Control triggers */}
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={() => start(selectedTemplateId, "cascade")}
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-on-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Simulation</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resume}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pause}
                      className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={reset}
                    className="py-2.5 px-4 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/25 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>

            {/* Speeds selector */}
            <div className="flex bg-white/5 border border-white/5 p-1 rounded-lg">
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "flex-1 py-1 rounded text-[10px] font-black font-mono tracking-wider cursor-pointer transition-colors",
                    speedMultiplier === s ? "bg-primary text-white shadow" : "text-white/40 hover:text-white"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Quick Demo Scenario Loader */}
            <div className="border-t border-white/10 pt-3 mt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/45 block mb-2">
                Scenario Loader (Seed & Run)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: "Fire", id: "fire-gate-5", color: "hover:bg-red-500/20 hover:text-red-400 border-red-500/20 text-red-300/90" },
                  { label: "Medical", id: "med-stage-b", color: "hover:bg-emerald-500/20 hover:text-emerald-400 border-emerald-500/20 text-emerald-300/90" },
                  { label: "Crowd Panic", id: "stampede-exit-c", color: "hover:bg-amber-500/20 hover:text-amber-400 border-amber-500/20 text-amber-300/90" },
                  { label: "Lost Child", id: "lost-child-zone-a", color: "hover:bg-blue-500/20 hover:text-blue-400 border-blue-500/20 text-blue-300/90" },
                  { label: "Violence", id: "violence-gate-1", color: "hover:bg-rose-500/20 hover:text-rose-400 border-rose-500/20 text-rose-300/90" }
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handleQuickLaunch(btn.id, btn.label)}
                    className={cn(
                      "py-1.5 px-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-white/5 transition-all cursor-pointer text-center truncate",
                      btn.color
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Health Deck (3 columns) */}
        <div className="xl:col-span-3 glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-tertiary" />
              <span>Grid Integrations</span>
            </h3>
            <p className="text-[11px] text-white/50">
              Live status indicator vectors for EOC system clusters.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Supabase connection health */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-white/40" /> Database Stream
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                supabaseStatus === "connected" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-error/15 text-error border-error/20"
              )}>
                {supabaseStatus === "connected" ? "Connected" : "Offline"}
              </span>
            </div>

            {/* AI Realtime subscription health */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60 font-semibold flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-white/40" /> Realtime Pub/Sub
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                realtimeConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" 
                  : "bg-tertiary/15 text-tertiary border-tertiary/20"
              )}>
                {realtimeConnected ? "Active" : "Degraded"}
              </span>
            </div>

            {/* Map health */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60 font-semibold flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-white/40" /> Presentation Mode
              </span>
              <button
                onClick={() => {
                  const nextDemo = !demoMode;
                  setDemoMode(nextDemo);
                  addToast({
                    title: nextDemo ? "Presentation Optimized" : "Standard Interface Restored",
                    description: nextDemo ? "Fonts and layout scaled for projector layouts." : "Default typography returned.",
                    type: "info"
                  });
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer",
                  demoMode 
                    ? "bg-tertiary text-on-tertiary border-tertiary font-bold" 
                    : "bg-white/5 text-white/50 border-white/5 hover:text-white"
                )}
              >
                {demoMode ? "Active" : "Normal"}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Board (4 columns) */}
        <div className="xl:col-span-4 glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Operations Live Metrics</span>
            </h3>
            <p className="text-[11px] text-white/50">
              Aggregated counts for current demonstration run.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/45">Incidents</span>
              <span className="text-lg font-black text-white mt-1">{incidents.length}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/45">Dispatched</span>
              <span className="text-lg font-black text-tertiary mt-1">
                {resources.filter(r => r.status === "Dispatched" || r.status === "Staged").length}
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/45">Alerts</span>
              <span className="text-lg font-black text-error mt-1">{alerts.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Live Map, Timeline & Copilot Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-6">
        
        {/* Live Map Card (6 columns) */}
        <div className="lg:col-span-6 glass-panel rounded-xl overflow-hidden border border-white/10 shadow-2xl h-[380px] relative">
          <div className="absolute top-4 left-4 z-10 bg-surface-container-low/90 backdrop-blur rounded px-2.5 py-1 border border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Operational Live Map Preview</span>
          </div>
          <LiveMap />
        </div>

        {/* Timeline Card (3 columns) */}
        <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden border border-white/10 shadow-2xl h-[380px] flex flex-col">
          <Timeline />
        </div>

        {/* Copilot Summary Card (3 columns) */}
        <div className="lg:col-span-3 glass-panel rounded-xl p-5 border border-white/10 shadow-2xl h-[380px] flex flex-col justify-between font-sans">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#ffb95f]/15 border border-[#ffb95f]/25 rounded text-[#ffb95f]">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">AI Copilot Triage</h3>
              </div>
              
              <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border", copilotRiskColor)}>
                {copilotRiskLevel} RISK
              </span>
            </div>

            {/* Situation Summary */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Current Situation Summary</span>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed font-medium">
                {copilotSituationSummary}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#b4c5ff] block">Recommended Action directive</span>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed font-semibold italic">
                "{copilotRecommendedAction}"
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[9px] font-mono text-white/40">
            <span>Last Updated: {formatTime(new Date().toISOString())}</span>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span>Grounded Context</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Active Incidents, Resources, Alerts, Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Incidents Panel (4 columns) */}
        <div className="xl:col-span-4 h-[350px]">
          <DemoIncidentsPanel />
        </div>

        {/* Resources Panel (3 columns) */}
        <div className="xl:col-span-3 h-[350px]">
          <DemoResourcesPanel />
        </div>

        {/* Alerts Panel (2 columns) */}
        <div className="xl:col-span-2 h-[350px]">
          <DemoAlertsPanel />
        </div>

        {/* Analytics Summary Panel (3 columns) */}
        <div className="xl:col-span-3 h-[350px]">
          <DemoAnalyticsPanel />
        </div>

      </div>
    </main>
  );
}
