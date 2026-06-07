"use client";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend
} from "recharts";
import { TrendingDown, Users, Timer, ShieldAlert } from "lucide-react";

// Color maps matching design guidelines
const PRIMARY = "#b4c5ff";
const SECONDARY = "#ffb3ad";
const TERTIARY = "#ffb95f";
const SUCCESS = "#10b981";
const ACCENT = "#8d90a0";

const INCIDENT_DISTRIBUTION = [
  { name: "Medical Emergency", value: 35, color: SUCCESS },
  { name: "Property & Robbery", value: 25, color: PRIMARY },
  { name: "Fire & Hazmat", value: 15, color: SECONDARY },
  { name: "Traffic Collision", value: 15, color: TERTIARY },
  { name: "Disturbance / Low Priority", value: 10, color: ACCENT },
];

const SECTOR_RESPONSE_TIMES = [
  { sector: "Sector 14", time: 3.5 },
  { sector: "Sector 29", time: 4.8 },
  { sector: "Sector 31", time: 3.9 },
  { sector: "Sector 43", time: 4.2 },
  { sector: "Sector 45", time: 5.1 },
  { sector: "Sector 56", time: 4.5 },
];

const HOURLY_CALL_VOLUME = [
  { hour: "08:00", calls: 12 },
  { hour: "10:00", calls: 18 },
  { hour: "12:00", calls: 32 },
  { hour: "14:00", calls: 24 },
  { hour: "16:00", calls: 28 },
  { hour: "18:00", calls: 45 },
  { hour: "20:00", calls: 38 },
  { hour: "22:00", calls: 15 },
];

const FLEET_STATUS_DATA = [
  { name: "Active Dispatched", value: 45, color: SECONDARY },
  { name: "Staged / Patrol", value: 35, color: PRIMARY },
  { name: "Idle Standby", value: 20, color: SUCCESS },
];

export default function AnalyticsPage() {
  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-background">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-on-surface">Coordination Analytics</h2>
        <p className="text-xs text-on-surface-variant/80">Historical dispatch performance indicators, incident distributions, and response latency grids.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Average Dispatch Latency</span>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-black text-on-surface font-mono-data">45s</span>
            <span className="text-xs font-semibold text-green-500 flex items-center mb-1 gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -12%
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Mean Resolution Duration</span>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-black text-on-surface font-mono-data">18.4m</span>
            <span className="text-xs font-semibold text-green-500 flex items-center mb-1 gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -5%
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Target SLA Success Rate</span>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-black text-primary font-mono-data">94.8%</span>
            <span className="text-xs text-on-surface-variant/85 mb-1">vs 90% benchmark</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Telemetry Overlap Grid</span>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-black text-tertiary font-mono-data">99.8%</span>
            <span className="text-xs text-on-surface-variant/85 mb-1">Target integrity</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sector Response Times (Bar) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Response Time by Sector</h3>
            <p className="text-xs text-on-surface-variant/70">Average dispatch-to-scene duration (Minutes)</p>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SECTOR_RESPONSE_TIMES} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 144, 160, 0.08)" />
                <XAxis dataKey="sector" stroke="#8d90a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8d90a0" fontSize={10} tickLine={false} axisLine={false} tickCount={6} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(20, 19, 20, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#e5e2e3"
                  }}
                />
                <Bar dataKey="time" fill={PRIMARY} radius={[4, 4, 0, 0]} className="drop-shadow-[0_0_6px_rgba(180,197,255,0.3)]">
                  {SECTOR_RESPONSE_TIMES.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.time > 5.0 ? SECONDARY : PRIMARY} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Call Volume Peaks (Line) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Peak Call Volume Load</h3>
            <p className="text-xs text-on-surface-variant/70">Hour-by-hour emergency call distributions</p>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_CALL_VOLUME} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 144, 160, 0.08)" />
                <XAxis dataKey="hour" stroke="#8d90a0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8d90a0" fontSize={10} tickLine={false} axisLine={false} tickCount={5} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(20, 19, 20, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#e5e2e3"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={TERTIARY} 
                  strokeWidth={2.5} 
                  dot={{ r: 4, strokeWidth: 1.5, fill: "#131314" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Category Distribution (Pie) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Incident Category Breakdown</h3>
            <p className="text-xs text-on-surface-variant/70">Proportionate load by operational incident type</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 gap-6">
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={INCIDENT_DISTRIBUTION}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {INCIDENT_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(20, 19, 20, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#e5e2e3",
                      fontSize: "11px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-col gap-2.5 max-w-[200px]">
              {INCIDENT_DISTRIBUTION.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-on-surface-variant/90 leading-tight font-medium">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Fleet Resource Status Distribution (Pie) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Fleet Allocation States</h3>
            <p className="text-xs text-on-surface-variant/70">Active dispatcher operational status percentages</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 gap-6">
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={FLEET_STATUS_DATA}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {FLEET_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(20, 19, 20, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#e5e2e3",
                      fontSize: "11px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-col gap-2.5 max-w-[200px]">
              {FLEET_STATUS_DATA.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-on-surface-variant/90 leading-tight font-medium">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
