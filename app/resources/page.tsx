"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Truck, Flame, Activity, BatteryCharging, BatteryWarning, Battery, ArrowUpRight, Check, X } from "lucide-react";
import { useSentinelStore } from "@/store/useSentinelStore";
import { RESOURCE_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ResourcesPage() {
  const resources = useSentinelStore((state) => state.resources);
  const setSelectedResourceId = useSentinelStore((state) => state.setSelectedResourceId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"ALL" | "POLICE" | "FIRE" | "MEDICAL">("ALL");

  // Summary Metrics
  const totalUnits = resources.length;
  const availableUnits = resources.filter((r) => r.status === "Available").length;
  const dispatchedUnits = resources.filter((r) => r.status === "Dispatched").length;
  const maintenanceUnits = resources.filter((r) => r.status === "Maintenance").length;

  // Filtering Logic
  const filteredResources = resources.filter((res) => {
    return activeTab === "ALL" || res.type === activeTab;
  });

  const handleTrackOnMap = (resId: string) => {
    // Set selected resource in store
    setSelectedResourceId(resId);
    // Redirect to Live Map
    router.push("/map");
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-background">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-on-surface">Fleet Resource Center</h2>
        <p className="text-xs text-on-surface-variant/80">Manage dispatcher units, fuel/battery telemetry levels, and real-time locations.</p>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <div className="glass-panel p-4.5 rounded-xl">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Fleet Size</p>
          <p className="text-2xl font-black text-on-surface font-mono-data mt-1">{totalUnits}</p>
        </div>
        {/* Available */}
        <div className="glass-panel p-4.5 rounded-xl border-l-2 border-l-primary">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Available Standby</p>
          <p className="text-2xl font-black text-primary font-mono-data mt-1">{availableUnits}</p>
        </div>
        {/* Dispatched */}
        <div className="glass-panel p-4.5 rounded-xl border-l-2 border-l-error">
          <p className="text-[10px] font-bold text-error uppercase tracking-wider">Active Dispatched</p>
          <p className="text-2xl font-black text-error font-mono-data mt-1">{dispatchedUnits}</p>
        </div>
        {/* Out of Service */}
        <div className="glass-panel p-4.5 rounded-xl border-l-2 border-l-outline">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">In Maintenance</p>
          <p className="text-2xl font-black text-on-surface-variant font-mono-data mt-1">{maintenanceUnits}</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex bg-surface-container-lowest border border-outline-variant/20 p-1.5 rounded-xl w-fit">
        {(["ALL", "POLICE", "FIRE", "MEDICAL"] as const).map((tab) => {
          const count = tab === "ALL" ? resources.length : resources.filter(r => r.type === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === tab
                  ? "bg-primary-container/20 text-primary border border-primary/25 font-bold"
                  : "text-on-surface-variant/75 hover:text-on-surface"
              )}
            >
              {tab === "ALL" && <Truck className="w-3.5 h-3.5" />}
              {tab === "POLICE" && <Shield className="w-3.5 h-3.5" />}
              {tab === "FIRE" && <Flame className="w-3.5 h-3.5" />}
              {tab === "MEDICAL" && <Activity className="w-3.5 h-3.5" />}
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const statusConfig = RESOURCE_STATUSES[res.status];
          
          // Fuel battery gauge colors
          const isLowFuel = res.fuel < 30;
          const FuelIcon = isLowFuel ? BatteryWarning : res.fuel > 80 ? BatteryCharging : Battery;

          return (
            <div 
              key={res.id}
              className="glass-panel rounded-xl p-5 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold text-outline">#{res.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      statusConfig.bullet
                    )} />
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusConfig.color)}>
                      {res.status}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  {res.type === "FIRE" && <Flame className="w-4.5 h-4.5 text-secondary" />}
                  {res.type === "MEDICAL" && <Activity className="w-4.5 h-4.5 text-green-500" />}
                  {res.type === "POLICE" && <Shield className="w-4.5 h-4.5 text-primary" />}
                  {res.name}
                </h3>

                {/* Telemetry info */}
                <div className="mt-4.5 space-y-2.5">
                  {/* Crew members */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline/80">Active Crew</span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {res.crew.length > 0 ? res.crew.join(", ") : "No assigned crew"}
                    </span>
                  </div>

                  {/* Fuel / Battery levels */}
                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-outline/80">
                      <span className="flex items-center gap-1">
                        <FuelIcon className={cn("w-3.5 h-3.5", isLowFuel ? "text-error" : "text-primary")} /> 
                        Battery Capacity
                      </span>
                      <span className={cn(isLowFuel ? "text-error" : "text-on-surface-variant")}>
                        {res.fuel}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 shadow-inner">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          isLowFuel 
                            ? "bg-error shadow-[0_0_6px_var(--color-error)]" 
                            : "bg-primary shadow-[0_0_6px_var(--color-primary)]"
                        )}
                        style={{ width: `${res.fuel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-3.5 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-mono-data text-outline/80">
                <span>Sector: {res.location.split(",")[0]}</span>
                {res.status !== "Maintenance" && (
                  <button
                    onClick={() => handleTrackOnMap(res.id)}
                    className="text-primary group-hover:text-primary-fixed-dim hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    TRACK UNIT <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
