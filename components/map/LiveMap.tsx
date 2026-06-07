"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically load the Leaflet map renderer, disabling Server-Side Rendering
const DynamicMap = dynamic(() => import("./LiveMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-bold font-mono-data text-primary tracking-widest uppercase animate-pulse">
          Syncing Map Vectors...
        </span>
      </div>
    </div>
  ),
});

export default function LiveMap() {
  return (
    <div className="w-full h-full relative">
      <DynamicMap />
    </div>
  );
}
