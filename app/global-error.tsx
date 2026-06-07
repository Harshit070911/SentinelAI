"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw, Home } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Intercepted Exception:", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[#0A0A0B] text-[#e5e2e3] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl border border-error/25 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden font-sans">
          {/* Top critical error accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-error/40 via-error to-error/40" />

          <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center text-error animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2.5">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Something went wrong.
            </h2>
            <p className="text-xs text-[#c3c6d7] leading-relaxed font-medium">
              A critical global telemetry fault occurred. Core networks have been isolated to maintain simulator safety.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => reset()}
              className="flex-1 py-2.5 px-4 bg-error hover:bg-error/85 text-on-error rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-error/15 flex items-center justify-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset System</span>
            </button>
            <a
              href="/dashboard"
              className="flex-1 py-2.5 px-4 bg-[#2a2a2b] hover:bg-[#353436] border border-[#434655]/40 rounded-lg text-xs font-black uppercase tracking-wider text-[#e5e2e3] text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
