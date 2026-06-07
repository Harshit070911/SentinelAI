"use client";

import { BrainCircuit, User, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/helpers";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
  toolUsed?: string | null;
}

export default function MessageBubble({
  sender,
  text,
  timestamp,
  confidence,
  sources,
  toolUsed,
}: MessageBubbleProps) {
  const isAi = sender === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex w-full", isAi ? "justify-start" : "justify-end")}
    >
      <div className={cn("max-w-xl flex gap-3.5", !isAi && "flex-row-reverse")}>
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-md",
            isAi
              ? "bg-primary-container/20 border-primary/30 text-primary"
              : "bg-surface-container-highest border-outline-variant/30 text-on-surface"
          )}
        >
          {isAi ? (
            <BrainCircuit className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>

        {/* Message Body */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-outline/85 font-mono-data">
            {isAi ? "Sentinel Copilot" : "Commander Hayes"} •{" "}
            {formatTime(timestamp)}
          </span>

          <div
            className={cn(
              "p-4 rounded-2xl border text-sm leading-relaxed",
              isAi
                ? "bg-surface-container/60 backdrop-blur-md border-outline-variant/15 rounded-tl-sm text-on-surface"
                : "bg-surface-bright border-outline-variant/10 rounded-tr-sm text-on-surface-variant/90 font-medium"
            )}
          >
            {/* Render text with basic markdown-like formatting */}
            <div className="whitespace-pre-wrap">{text}</div>

            {/* AI Metadata Footer */}
            {isAi && (confidence !== undefined || toolUsed || (sources && sources.length > 0)) && (
              <div className="mt-3 pt-2.5 border-t border-outline-variant/10 space-y-1.5">
                {/* Confidence + Tool */}
                <div className="flex items-center gap-3 flex-wrap">
                  {confidence !== undefined && (
                    <span className="flex items-center gap-1 text-[10px] font-mono-data text-primary/80">
                      <ShieldCheck className="w-3 h-3" />
                      Confidence: {(confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {toolUsed && (
                    <span className="text-[10px] font-mono-data text-tertiary/80 bg-tertiary/5 border border-tertiary/10 px-1.5 py-0.5 rounded">
                      Tool: {toolUsed}
                    </span>
                  )}
                </div>

                {/* Sources */}
                {sources && sources.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-outline/60 uppercase tracking-wider">
                      Sources:
                    </span>
                    {sources.slice(0, 5).map((src, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono-data text-primary/70 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded"
                      >
                        {src.length > 20 ? src.slice(0, 8) + "..." : src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
