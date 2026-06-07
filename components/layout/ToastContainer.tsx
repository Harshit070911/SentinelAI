"use client";

import { useSentinelStore } from "../../store/useSentinelStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ToastContainer() {
  const toasts = useSentinelStore((state) => state.toasts);
  const dismissToast = useSentinelStore((state) => state.dismissToast);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";
          const isSuccess = toast.type === "success";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={cn(
                "glass-modal p-4 rounded-xl border flex gap-3.5 shadow-2xl items-start pointer-events-auto cursor-default overflow-hidden relative group",
                isError ? "border-error/30" : isWarning ? "border-tertiary/30" : isSuccess ? "border-emerald-500/20" : "border-white/10"
              )}
            >
              {/* Type Indicator Left Bar */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  isError ? "bg-error" : isWarning ? "bg-tertiary" : isSuccess ? "bg-emerald-500" : "bg-primary"
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  "p-1.5 rounded-lg border shrink-0 mt-0.5",
                  isError
                    ? "bg-error/15 text-error border-error/25 pulse-critical"
                    : isWarning
                    ? "bg-tertiary/15 text-tertiary border-tertiary/25"
                    : isSuccess
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {isError ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : isSuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 font-sans">
                <h4 className="text-xs font-black text-white uppercase tracking-wider leading-tight">
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-[11px] text-on-surface-variant/90 leading-snug mt-1 font-medium">
                    {toast.description}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-white/40 hover:text-white hover:bg-white/5 p-1 rounded transition-all shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
