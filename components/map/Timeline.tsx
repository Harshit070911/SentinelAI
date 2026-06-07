"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { IncidentEvent } from "../../types";
import { formatTime } from "../../lib/helpers";
import { useSentinelStore } from "../../store/useSentinelStore";
import { cn } from "../../lib/utils";
import { 
  AlertCircle, 
  Brain, 
  Radio, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  BellRing
} from "lucide-react";

export default function Timeline() {
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const incidents = useSentinelStore((state) => state.incidents);
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const setSelectedIncidentId = useSentinelStore((state) => state.setSelectedIncidentId);

  // Fetch initial events from database
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("incident_events")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const mapped = (data || []).map((e: any) => ({
          id: e.id,
          incidentId: e.incident_id,
          eventType: e.event_type,
          description: e.description || "",
          createdAt: e.created_at || new Date().toISOString(),
        }));
        
        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load timeline events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    const handleDbSeeded = () => {
      fetchEvents();
    };
    window.addEventListener("sentinel-db-seeded", handleDbSeeded);

    // Subscribe to realtime incident_events insertion
    const channel = supabase
      .channel("realtime-timeline-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incident_events" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === "INSERT") {
            const mappedEvent: IncidentEvent = {
              id: newRecord.id,
              incidentId: newRecord.incident_id,
              eventType: newRecord.event_type,
              description: newRecord.description || "",
              createdAt: newRecord.created_at || new Date().toISOString(),
            };
            setEvents((prev) => [mappedEvent, ...prev]);
          } else if (eventType === "UPDATE") {
            const mappedEvent: IncidentEvent = {
              id: newRecord.id,
              incidentId: newRecord.incident_id,
              eventType: newRecord.event_type,
              description: newRecord.description || "",
              createdAt: newRecord.created_at || new Date().toISOString(),
            };
            setEvents((prev) =>
              prev.map((e) => (e.id === mappedEvent.id ? mappedEvent : e))
            );
          } else if (eventType === "DELETE") {
            setEvents((prev) => prev.filter((e) => e.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("sentinel-db-seeded", handleDbSeeded);
      supabase.removeChannel(channel);
    };
  }, []);

  // Map event type to visual icon and colors
  const getEventMeta = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes("create") || type.includes("report")) {
      return {
        icon: Radio,
        colorClass: "text-[#3b82f6] bg-blue-500/10 border-blue-500/20",
        nodeColor: "bg-[#3b82f6]",
      };
    }
    if (type.includes("classify") || type.includes("ai")) {
      return {
        icon: Brain,
        colorClass: "text-[#ffb4ab] bg-red-500/10 border-red-500/20",
        nodeColor: "bg-[#ffb4ab]",
      };
    }
    if (type.includes("dispatch")) {
      return {
        icon: ShieldAlert,
        colorClass: "text-[#ffb95f] bg-orange-500/10 border-orange-500/20",
        nodeColor: "bg-[#ffb95f]",
      };
    }
    if (type.includes("resolve")) {
      return {
        icon: CheckCircle,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        nodeColor: "bg-emerald-400",
      };
    }
    if (type.includes("alert")) {
      return {
        icon: BellRing,
        colorClass: "text-[#ffb4ab] bg-red-500/10 border-red-500/20",
        nodeColor: "bg-[#ffb4ab] animate-pulse",
      };
    }
    return {
      icon: Sparkles,
      colorClass: "text-primary bg-primary/10 border-primary/20",
      nodeColor: "bg-primary",
    };
  };

  return (
    <div className="w-full flex flex-col h-full bg-surface-container-lowest/80 backdrop-blur-md border-r border-outline-variant/20 overflow-hidden">
      {/* Header */}
      <div className="p-4.5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/30">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-error" /> Realtime Milestones
        </h2>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
        </span>
      </div>

      {/* Timeline Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="text-center py-8 text-xs text-on-surface-variant/60 font-medium font-mono animate-pulse">
            Syncing Events Ledger...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-xs text-on-surface-variant/60 font-medium">
            No system events logged.
          </div>
        ) : (
          events.map((event, index) => {
            const meta = getEventMeta(event.eventType);
            const EventIcon = meta.icon;
            
            // Find corresponding incident
            const relatedIncident = incidents.find((i) => i.id === event.incidentId);
            const isSelected = selectedIncidentId === event.incidentId;

            return (
              <div
                key={event.id}
                onClick={() => event.incidentId && setSelectedIncidentId(event.incidentId)}
                className="relative pl-6 cursor-pointer group"
              >
                {/* Connector Line */}
                {index !== events.length - 1 && (
                  <div className="absolute left-2.5 top-5 bottom-[-20px] w-px bg-outline-variant/20 group-hover:bg-primary/20 transition-colors" />
                )}

                {/* Event Node Dot */}
                <div className={cn(
                  "absolute left-1.5 top-1.5 w-2 h-2 rounded-full z-10 transition-transform group-hover:scale-125",
                  meta.nodeColor,
                  isSelected && "scale-125 ring-4 ring-primary/20"
                )} />

                {/* Event Card */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono-data text-outline/80">
                    {formatTime(event.createdAt)}
                  </span>
                  
                  <div className={cn(
                    "p-3 rounded-lg border transition-all duration-200 bg-surface-container-high/40 hover:bg-surface-container-high/70",
                    isSelected 
                      ? "border-primary/50 bg-primary-container/5 shadow-[0_0_12px_rgba(37,99,235,0.08)]" 
                      : "border-outline-variant/10",
                  )}>
                    {/* Header */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={cn("p-1 rounded border", meta.colorClass)}>
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                        {event.eventType}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant/90 leading-snug font-sans">
                      {event.description}
                    </p>

                    {relatedIncident && (
                      <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-outline-variant/10">
                        <span className="text-[9px] font-bold font-mono-data text-outline/80 bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/20 uppercase tracking-wider">
                          {relatedIncident.type}
                        </span>
                        <span className="text-[9px] font-mono text-primary/70">
                          ID: {relatedIncident.id.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
