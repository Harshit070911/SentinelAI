"use client";

import { useState } from "react";
import { Search, Filter, AlertOctagon, CircleDot, MapPin, Calendar, Compass, ArrowUpRight } from "lucide-react";
import { useSentinelStore } from "@/store/useSentinelStore";
import IncidentModal from "@/components/incidents/IncidentModal";
import { INCIDENT_PRIORITIES } from "@/lib/constants";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function IncidentsPage() {
  const incidents = useSentinelStore((state) => state.incidents);
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtering Logic
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch = 
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.type.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || inc.priority === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || inc.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-background">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-on-surface">Incident Directory</h2>
        <p className="text-xs text-on-surface-variant/80">Manage active emergency vectors, telemetry breaches, and unit dispatch assignments.</p>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, type, location..."
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/45 transition-colors"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/80 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter Priority:
          </div>
          <div className="flex gap-1.5">
            {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                  priorityFilter === pr
                    ? "bg-primary-container/20 text-primary border border-primary/30"
                    : "bg-surface-container-high text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-highest border border-transparent"
                )}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/80 font-semibold">
            <CircleDot className="w-3.5 h-3.5" /> Status:
          </div>
          <div className="flex gap-1.5">
            {(["ALL", "Unverified", "Dispatching", "On Scene", "Resolved"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                  statusFilter === st
                    ? "bg-primary-container/20 text-primary border border-primary/30"
                    : "bg-surface-container-high text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-highest border border-transparent"
                )}
              >
                {st === "ALL" ? "ALL" : st.replace(" ", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Incidents */}
      {filteredIncidents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-outline-variant/15 rounded-xl">
          <AlertOctagon className="w-8 h-8 text-on-surface-variant/40 mb-3" />
          <p className="text-sm font-semibold text-on-surface-variant/60">No incidents match the active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((inc) => {
            const priorityConfig = INCIDENT_PRIORITIES[inc.priority];
            const isResolved = inc.status === "Resolved";
            const isCritical = inc.priority === "CRITICAL" && !isResolved;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={cn(
                  "glass-panel rounded-xl p-5 border flex flex-col justify-between hover:border-primary/40 transition-all duration-300 group cursor-pointer relative overflow-hidden",
                  isCritical ? "border-error/30 hover:border-error/50 bg-error-container/[0.02]" : "border-outline-variant/20"
                )}
              >
                {/* Visual Glow for Criticals */}
                {isCritical && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-error/50 animate-pulse" />
                )}

                {/* Card Top */}
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="font-mono text-xs text-outline font-bold">#{inc.id}</span>
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border",
                      priorityConfig.badge
                    )}>
                      {inc.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {inc.type} <ArrowUpRight className="w-4 h-4 text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <p className="text-xs text-on-surface-variant/85 leading-snug font-sans mt-2.5 line-clamp-3">
                    {inc.description}
                  </p>
                </div>

                {/* Card Bottom */}
                <div className="mt-5 pt-3 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-mono-data text-outline/80">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-outline/60" /> {inc.location.split(",")[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-outline/60" /> {formatTime(inc.timestamp)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                      inc.status === "On Scene" ? "bg-error/15 text-error border-error/20" :
                      inc.status === "Dispatching" ? "bg-tertiary/15 text-tertiary border-tertiary/20" :
                      inc.status === "Resolved" ? "bg-surface-container text-outline/65 border-outline-variant/20" :
                      "bg-surface-container-high text-on-surface-variant/80 border-outline-variant/20"
                    )}>
                      {inc.status}
                    </span>
                    <span className="text-[9px]">
                      {inc.assignedResources.length > 0 ? `${inc.assignedResources.length} Units Assigned` : "No Units Staged"}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Incident Details Modal Container */}
      {selectedIncidentId && <IncidentModal />}
    </div>
  );
}
