"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, ShieldAlert, X, AlertTriangle, Radio, Check, Brain, Shield, Info, Volume2 } from "lucide-react";
import { useSentinelStore } from "../../store/useSentinelStore";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabase/client";

export default function Header() {
  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const alerts = useSentinelStore((state) => state.alerts);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);
  const setSelectedResourceId = useSentinelStore((state) => state.setSelectedResourceId);
  
  const activeAlertsCount = alerts.filter(a => a.broadcasted).length;

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchFilter, setSearchFilter] = useState<"ALL" | "INCIDENTS" | "RESOURCES" | "ALERTS">("ALL");
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const notificationRef = useRef<HTMLDivElement>(null);

  // Emergency Broadcast Modal States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSeverity, setBroadcastSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter items based on query AND searchFilter
  const queryLower = searchQuery.toLowerCase();

  const filteredIncidents = incidents.filter((i) => {
    if (searchFilter !== "ALL" && searchFilter !== "INCIDENTS") return false;
    if (searchQuery) {
      return (
        i.id.toLowerCase().includes(queryLower) ||
        i.type.toLowerCase().includes(queryLower) ||
        i.location.toLowerCase().includes(queryLower) ||
        i.description.toLowerCase().includes(queryLower)
      );
    }
    // If query is empty, suggest active (unresolved) incidents
    return i.status !== "Resolved";
  });

  const filteredResources = resources.filter((r) => {
    if (searchFilter !== "ALL" && searchFilter !== "RESOURCES") return false;
    if (searchQuery) {
      return (
        r.id.toLowerCase().includes(queryLower) ||
        r.name.toLowerCase().includes(queryLower) ||
        r.type.toLowerCase().includes(queryLower)
      );
    }
    // If query is empty, suggest available units
    return r.status === "Available";
  });

  const filteredAlertsForSearch = alerts.filter((a) => {
    if (searchFilter !== "ALL" && searchFilter !== "ALERTS") return false;
    if (searchQuery) {
      return (
        a.title.toLowerCase().includes(queryLower) ||
        a.message.toLowerCase().includes(queryLower)
      );
    }
    // If query is empty, suggest active broadcasts
    return a.broadcasted;
  });

  // Limit display amounts
  const displayIncidents = searchQuery ? filteredIncidents.slice(0, 4) : filteredIncidents.slice(0, 3);
  const displayResources = searchQuery ? filteredResources.slice(0, 4) : filteredResources.slice(0, 3);
  const displayAlerts = searchQuery ? filteredAlertsForSearch.slice(0, 4) : filteredAlertsForSearch.slice(0, 3);

  const hasSearchItems = displayIncidents.length > 0 || displayResources.length > 0 || displayAlerts.length > 0;

  // Filter alerts for Notification Dropdown
  const filteredAlerts = alerts.filter((a) => {
    if (notificationFilter === "ALL") return true;
    const severityUpper = a.severity.toUpperCase();
    if (notificationFilter === "CRITICAL") {
      return severityUpper === "CRITICAL" || severityUpper === "SEVERE";
    }
    return severityUpper === notificationFilter;
  });

  // Handle Quick Search click selection
  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleSelectResource = (id: string) => {
    setSelectedResourceId(id);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  // Submit Emergency Fast Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setIsBroadcasting(true);
    try {
      const { error } = await supabase.from("alerts").insert([
        {
          title: broadcastTitle,
          message: broadcastMessage,
          severity: broadcastSeverity,
        },
      ]);

      if (error) throw error;

      setBroadcastSuccess(true);
      setBroadcastTitle("");
      setBroadcastMessage("");
      
      // Auto close success alert after 2s
      setTimeout(() => {
        setBroadcastSuccess(false);
        setShowBroadcastModal(false);
      }, 2000);
    } catch (err) {
      console.error("Emergency broadcast failed:", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-20 md:left-64 right-0 z-40 flex justify-between items-center px-6 h-16 bg-background/70 backdrop-blur-xl border-b border-outline-variant/30 text-primary transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Pulsing SVG Shield Logo */}
          <svg className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(180,197,255,0.4)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 20L40 50V100C40 145 100 180 100 180C100 180 160 145 160 100V50L100 20Z" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="100" cy="100" r="15" fill="#EF4444" className="animate-pulse" />
            <path d="M85 100H115" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M100 85V115" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-black tracking-tighter text-primary bg-gradient-to-r from-primary to-[#dbe1ff] bg-clip-text text-transparent inline-block pr-2 pb-0.5">
            SentinelAI
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Global Quick Search Bar with decreased opacity */}
          <div ref={searchRef} className="relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/60 w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search resources, incidents..."
              className="w-72 bg-white/[0.08] hover:bg-white/[0.06] border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-white/20 focus:bg-white/[0.07] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
            />

            {/* Quick Search Dropdown Container with suggestions and filter option */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-panel border border-white/10 rounded-xl p-3 absolute top-12 left-0 w-80 max-h-[400px] overflow-y-auto z-[2000] shadow-2xl flex flex-col gap-3.5 font-sans text-white bg-black/80 backdrop-blur-xl"
                >
                  {/* Search Filter options */}
                  <div className="flex gap-1.5 border-b border-white/5 pb-2">
                    {(["ALL", "INCIDENTS", "RESOURCES", "ALERTS"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSearchFilter(filter)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] font-black tracking-wider uppercase transition-colors cursor-pointer",
                          searchFilter === filter
                            ? "bg-primary text-on-primary font-bold shadow"
                            : "bg-white/5 text-white/40 hover:text-white"
                        )}
                      >
                        {filter === "ALL" ? "All" : filter.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {!hasSearchItems ? (
                    <div className="text-center py-6 text-xs text-white/40 font-mono">
                      No records match query.
                    </div>
                  ) : (
                    <div className="space-y-3.5 overflow-y-auto pr-1 no-scrollbar max-h-[300px]">
                      {/* Section label */}
                      {!searchQuery && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#b4c5ff]/70 block px-1">
                          Operational Suggestions
                        </span>
                      )}

                      {/* Incidents Section */}
                      {displayIncidents.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block px-1">
                            Incidents
                          </span>
                          {displayIncidents.map((inc) => (
                            <button
                              key={inc.id}
                              type="button"
                              onClick={() => handleSelectIncident(inc.id)}
                              className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors flex justify-between items-start border border-transparent hover:border-white/5 cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <h4 className="text-xs font-bold text-white truncate">{inc.type}</h4>
                                <p className="text-[10px] text-white/50 truncate italic mt-0.5">"{inc.location}"</p>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black font-mono-data px-1.5 py-0.5 rounded border uppercase shrink-0",
                                inc.priority === "CRITICAL" ? "bg-error/15 text-error border-error/25" : "bg-tertiary/15 text-tertiary border-tertiary/25"
                              )}>
                                {inc.priority}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Divider */}
                      {displayIncidents.length > 0 && displayResources.length > 0 && (
                        <div className="h-px bg-white/5" />
                      )}

                      {/* Resources Section */}
                      {displayResources.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block px-1">
                            Resources
                          </span>
                          {displayResources.map((res) => (
                            <button
                              key={res.id}
                              type="button"
                              onClick={() => handleSelectResource(res.id)}
                              className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors flex justify-between items-start border border-transparent hover:border-white/5 cursor-pointer"
                            >
                              <div>
                                <h4 className="text-xs font-bold text-white">{res.name}</h4>
                                <p className="text-[10px] text-white/50 mt-0.5">{res.type} • Status: {res.status}</p>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black font-mono-data px-1.5 py-0.5 rounded border uppercase shrink-0",
                                res.status === "Available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-error/10 text-error border-error/20"
                              )}>
                                {res.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Divider */}
                      {((displayIncidents.length > 0 || displayResources.length > 0) && displayAlerts.length > 0) && (
                        <div className="h-px bg-white/5" />
                      )}

                      {/* Alerts Section */}
                      {displayAlerts.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block px-1">
                            Active Broadcast Alerts
                          </span>
                          {displayAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              className="w-full p-2 rounded bg-white/[0.01] border border-white/5 hover:bg-white/5 transition-colors flex justify-between items-start"
                            >
                              <div className="min-w-0 pr-2">
                                <h4 className="text-xs font-bold text-white truncate">{alert.title}</h4>
                                <p className="text-[10px] text-white/60 leading-snug mt-0.5">{alert.message}</p>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black font-mono-data px-1.5 py-0.5 rounded border uppercase shrink-0",
                                alert.severity === "CRITICAL" || alert.severity === "SEVERE"
                                  ? "bg-error/15 text-error border-error/25 animate-pulse"
                                  : "bg-primary/10 text-primary border-primary/20"
                              )}>
                                {alert.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown Container with decreased opacity */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors relative group cursor-pointer"
              >
                <Bell className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                {activeAlertsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel border border-white/10 rounded-xl p-4 absolute top-12 right-0 w-80 max-h-[440px] overflow-y-auto z-[2000] shadow-2xl flex flex-col gap-3 font-sans text-white bg-black/55 backdrop-blur-xl"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-primary font-mono">
                        Notifications
                      </span>
                      {activeAlertsCount > 0 && (
                        <span className="bg-error/20 border border-error/30 text-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {activeAlertsCount} Broadcasts
                        </span>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1 border-b border-white/5 pb-2">
                      {(["ALL", "CRITICAL", "WARNING", "INFO"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setNotificationFilter(filter)}
                          className={cn(
                            "px-2 py-1 rounded text-[9px] font-black tracking-wider uppercase transition-colors cursor-pointer",
                            notificationFilter === filter
                              ? "bg-primary text-on-primary font-bold shadow"
                              : "bg-white/5 text-white/40 hover:text-white"
                          )}
                        >
                          {filter === "ALL" ? "All" : filter}
                        </button>
                      ))}
                    </div>

                    {/* Alerts Feed */}
                    <div className="space-y-2 overflow-y-auto pr-1 no-scrollbar animate-none">
                      {filteredAlerts.length === 0 ? (
                        <div className="text-center py-6 text-xs text-white/40 font-mono">
                          No active notifications in filter grid.
                        </div>
                      ) : (
                        filteredAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02] flex items-start gap-2.5 transition-all hover:bg-white/5"
                          >
                            <div className={cn(
                              "p-1.5 rounded shrink-0",
                              alert.severity === "CRITICAL" || alert.severity === "SEVERE"
                                ? "bg-error/15 text-error border border-error/25 animate-pulse"
                                : alert.severity === "WARNING"
                                ? "bg-tertiary/15 text-tertiary border border-tertiary/25"
                                : "bg-primary/15 text-primary border border-primary/25"
                            )}>
                              {alert.severity === "CRITICAL" || alert.severity === "SEVERE" ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : alert.severity === "WARNING" ? (
                                <Radio className="w-3.5 h-3.5" />
                              ) : (
                                <Info className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white truncate leading-snug">{alert.title}</h4>
                              <p className="text-[10px] text-white/65 leading-snug font-sans">{alert.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emergency Fast Broadcast Button */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-2.5 rounded-full text-error/60 hover:text-error hover:bg-error/10 transition-colors cursor-pointer group"
              title="Fast Emergency Broadcast"
            >
              <ShieldAlert className="w-5 h-5 fill-error/10 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="h-8 w-px bg-outline-variant/30 hidden sm:block"></div>

          {/* User Card */}
          <button className="flex items-center gap-3 hover:bg-white/5 transition-all p-1 pr-3 rounded-full border border-outline-variant/20 group cursor-pointer">
            <img
              alt="Cmdr. Hayes profile picture"
              className="w-8 h-8 rounded-full object-cover border border-primary/50 group-hover:border-primary transition-colors"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKjPRf4zKV2TU10w2YysfKvEGieA7RzJEac0jgeH4cZ3wfBveJiyfcAXXk8hMx9cwHeJ7M6zZZqbsKN1BXgptKB1FOdcmRlf7syvlXDFfrnpSrjgftVWRi5Es7_xdnLDIXntJE70vKcy94_XvnfLEgsjth16Hw581nPS-IWSOd5ko0KnK1HIr8IfEGoVkfFPnyZXD1nNx0-dDaCmpx9qquCZCRdA-NNA8mZPuHxPTmDqX4uuGsmlciDdA5qclDGIHBIMZZmdwAIM5-"
            />
            <div className="flex flex-col items-start text-left hidden md:flex">
              <span className="text-xs font-semibold text-on-surface">Cmdr. Hayes</span>
              <span className="text-[10px] text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                On Duty
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Emergency Fast Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isBroadcasting && setShowBroadcastModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-modal border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 font-sans text-white"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3.5 mb-4">
                <div className="flex items-center gap-2 text-error">
                  <ShieldAlert className="w-5 h-5 fill-error/20" />
                  <h3 className="font-extrabold text-sm uppercase tracking-widest font-mono">
                    Emergency Fast Broadcast
                  </h3>
                </div>
                {!isBroadcasting && (
                  <button
                    onClick={() => setShowBroadcastModal(false)}
                    className="p-1 rounded hover:bg-white/5 transition-colors cursor-pointer text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {broadcastSuccess ? (
                <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-sm">Emergency Alert Broadcasted</h4>
                  <p className="text-xs text-white/60">
                    AI safety warning has been successfully pushed to the grid.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40">
                      Alert Title
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Armed Incident, Gate 5 Smoke Warning"
                      className="w-full bg-[#131314]/90 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-error focus:ring-1 focus:ring-error/20 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40">
                      Advisory Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter emergency directions, escape vector prompts, or perimeter warnings..."
                      className="w-full bg-[#131314]/90 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-error focus:ring-1 focus:ring-error/20 transition-all font-sans resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40">
                      Alert Severity Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["critical", "high", "medium", "low"] as const).map((sev) => (
                        <button
                          type="button"
                          key={sev}
                          onClick={() => setBroadcastSeverity(sev)}
                          className={cn(
                            "py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer",
                            broadcastSeverity === sev
                              ? "bg-error text-on-error font-bold shadow-md border-error"
                              : "bg-[#131314]/90 text-white/50 border-white/5 hover:text-white"
                          )}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      disabled={isBroadcasting}
                      onClick={() => setShowBroadcastModal(false)}
                      className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold transition-all hover:bg-white/10 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBroadcasting}
                      className="flex-1 py-2.5 rounded-lg bg-error hover:bg-error/80 text-on-error font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isBroadcasting ? (
                        <span>Broadcasting...</span>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>Broadcast Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
