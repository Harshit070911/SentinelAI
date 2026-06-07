"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const MOCK_DATA_24H = [
  { time: "00:00", volume: 15 },
  { time: "04:00", volume: 10 },
  { time: "08:00", volume: 22 },
  { time: "12:00", volume: 38 },
  { time: "16:00", volume: 30 },
  { time: "20:00", volume: 42 },
  { time: "24:00", volume: 25 },
];

const MOCK_DATA_12H = [
  { time: "08:00", volume: 22 },
  { time: "10:00", volume: 28 },
  { time: "12:00", volume: 38 },
  { time: "14:00", volume: 34 },
  { time: "16:00", volume: 30 },
  { time: "18:00", volume: 40 },
  { time: "20:00", volume: 42 },
];

const MOCK_DATA_7D = [
  { time: "Mon", volume: 120 },
  { time: "Tue", volume: 140 },
  { time: "Wed", volume: 110 },
  { time: "Thu", volume: 165 },
  { time: "Fri", volume: 180 },
  { time: "Sat", volume: 210 },
  { time: "Sun", volume: 150 },
];

export default function TrendChart() {
  const [range, setRange] = useState<"12h" | "24h" | "7d">("24h");

  const data = 
    range === "12h" 
      ? MOCK_DATA_12H 
      : range === "7d" 
      ? MOCK_DATA_7D 
      : MOCK_DATA_24H;

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface">Incident Trends</h3>
          <p className="text-xs text-on-surface-variant/70">Real-time incident volume analytics</p>
        </div>
        <div className="flex gap-2 bg-surface-container-low border border-outline-variant/30 rounded p-1">
          {(["12h", "24h", "7d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                range === r
                  ? "bg-primary-container/20 text-primary border border-primary/30"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b4c5ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#b4c5ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 144, 160, 0.08)" />
            <XAxis
              dataKey="time"
              stroke="#8d90a0"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8d90a0"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 19, 20, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                color: "#e5e2e3",
                fontSize: "12px",
                fontFamily: "var(--font-geist-mono)"
              }}
              labelStyle={{ fontWeight: "bold", color: "#b4c5ff" }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#b4c5ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#primaryGlow)"
              className="drop-shadow-[0_0_8px_rgba(180,197,255,0.4)]"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
