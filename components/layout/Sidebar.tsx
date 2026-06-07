"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  BrainCircuit, 
  BellRing, 
  Settings, 
  HelpCircle,
  Activity,
  Play
} from "lucide-react";
import { useSentinelStore } from "../../store/useSentinelStore";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle, devOnly: true },
  { href: "/resources", label: "Resources", icon: Shield, devOnly: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/copilot", label: "AI Copilot", icon: BrainCircuit, color: "text-tertiary" },
  { href: "/alerts", label: "Alerts", icon: BellRing, badge: true, devOnly: true },
  { href: "/simulator", label: "Simulator", icon: Play }
];

export default function Sidebar() {
  const pathname = usePathname();
  const alerts = useSentinelStore((state) => state.alerts);
  const demoMode = useSentinelStore((state) => state.demoMode);
  const setDemoMode = useSentinelStore((state) => state.setDemoMode);
  const addToast = useSentinelStore((state) => state.addToast);
  const activeAlertsCount = alerts.filter(a => a.broadcasted).length;

  // Filter items in demo mode
  const filteredNavItems = NAV_ITEMS.filter(item => !demoMode || !item.devOnly);

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 bg-surface-container-lowest border-r border-outline-variant/20 w-20 md:w-64 z-50 transition-all duration-300">
      {/* Brand Header */}
      <div className="px-6 pb-6 border-b border-outline-variant/10 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30 shrink-0">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col hidden md:flex opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
          <h1 className="text-sm font-bold text-primary tracking-wide">Command Center</h1>
          <p className="text-xs text-outline font-mono">Gurgaon Node 7A</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 transition-all group duration-200"
              )}
            >
              {/* Active Background Glow using Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary-container/10 border border-primary/25 rounded-lg -z-10 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-200",
                  isActive ? "text-primary" : "text-on-surface-variant",
                  item.color
                )}
              />

              <span
                className={cn(
                  "text-sm font-medium hidden md:block",
                  isActive ? "text-on-surface font-semibold" : "text-on-surface-variant",
                  item.color
                )}
              >
                {item.label}
              </span>

              {/* Alerts Badge */}
              {item.badge && activeAlertsCount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden md:block">
                  {activeAlertsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Settings & Support */}
      <div className="px-3 pt-6 border-t border-outline-variant/10 mt-auto space-y-1.5">
        {/* Presentation Toggle */}
        <button
          onClick={() => {
            const nextMode = !demoMode;
            setDemoMode(nextMode);
            addToast({
              title: nextMode ? "Demo Mode Active" : "Demo Mode Deactivated",
              description: nextMode
                ? "Fitted for Live Judge presentation. Development sections isolated."
                : "All directory pages and raw telemetry views unlocked.",
              type: "info"
            });
          }}
          className={cn(
            "flex items-center gap-4 px-4 py-2.5 rounded-lg w-full text-left transition-all duration-300 group cursor-pointer border",
            demoMode 
              ? "text-tertiary bg-tertiary/10 border-tertiary/20 hover:bg-tertiary/15" 
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 border-transparent"
          )}
          title="Toggle Presentation Mode"
        >
          <Activity className={cn("w-5 h-5 shrink-0", demoMode && "animate-pulse")} />
          <span className="text-sm font-semibold hidden md:block">
            {demoMode ? "Demo Active" : "Normal Mode"}
          </span>
        </button>

        <Link
          href="/demo"
          className="flex items-center gap-4 px-4 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 transition-all group"
        >
          <Settings className="w-5 h-5 shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          <span className="text-sm font-medium hidden md:block">Demo Console</span>
        </Link>
      </div>
    </aside>
  );
}
