import Link from "next/link";
import { Maximize2, MapPin } from "lucide-react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TrendChart from "@/components/charts/TrendChart";
import RecentIncidents from "@/components/dashboard/RecentIncidents";
import AIInsights from "@/components/dashboard/AIInsights";

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 bg-background">
      {/* Left/Center Column (8 cols wide on desktop) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Statistics Widgets */}
        <StatsGrid />
        
        {/* Incident Trends Chart */}
        <TrendChart />
        
        {/* Recent Incidents Table */}
        <RecentIncidents />
        
      </div>

      {/* Right Column (4 cols wide on desktop) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* AI Copilot Insights Panel */}
        <AIInsights />
        
        {/* Mini Map Navigation Preview */}
        <Link 
          href="/map"
          className="glass-panel rounded-xl p-2.5 h-64 relative overflow-hidden group cursor-pointer block border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
        >
          {/* Futuristic map grid styled background */}
          <div 
            className="absolute inset-0 bg-surface-container-lowest opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.15) 0%, transparent 80%),
                                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
              backgroundSize: "100% 100%, 20px 20px, 20px 20px"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 bg-surface-container-highest/80 backdrop-blur rounded px-2.5 py-1 border border-outline-variant/30 flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-[10px] font-bold font-mono-data text-on-surface uppercase tracking-wider">Live Coordinates</span>
          </div>

          {/* Interactive Markers inside Preview Map */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Center Pulsing Marker */}
            <div className="relative w-8 h-8 flex items-center justify-center scale-90">
              <div className="absolute inset-0 rounded-full bg-error/20 animate-ping" />
              <MapPin className="w-5 h-5 text-error filter drop-shadow-[0_0_8px_var(--color-error)]" />
            </div>
          </div>

          {/* Hover Action Prompt */}
          <div className="absolute bottom-4 right-4 bg-surface-container-highest/90 backdrop-blur rounded p-2 border border-outline-variant/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface">Expand Live Map</span>
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
          </div>
        </Link>
        
      </div>
    </div>
  );
}
