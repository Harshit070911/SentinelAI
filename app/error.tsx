"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to system logs (never show stack traces directly in UI)
    console.error("Application Intercepted Crash:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background min-h-[500px]">
      <div className="glass-panel p-8 rounded-2xl border border-error/20 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-error/50 via-error to-error/50" />

        <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center text-error animate-pulse">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2.5 font-sans">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            Something went wrong.
          </h2>
          <p className="text-xs text-on-surface-variant/80 leading-relaxed font-medium">
            The Operator Command Center encountered an unexpected system exception. Live telemetry records have been preserved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full font-sans">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 bg-error hover:bg-error/85 text-on-error rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-error/15 flex items-center justify-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reload Panel</span>
          </button>
          <a
            href="/dashboard"
            className="flex-1 py-2.5 px-4 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/35 rounded-lg text-xs font-black uppercase tracking-wider text-on-surface text-center transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
}
