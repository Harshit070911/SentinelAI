"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { useSentinelStore } from "../../store/useSentinelStore";
import { MAP_CENTER, DEFAULT_ZOOM } from "../../lib/constants";
import { useMapIncidents } from "../../hooks/useMapIncidents";
import { useMapResources } from "../../hooks/useMapResources";
import IncidentMarker from "./IncidentMarker";
import ResourceMarker from "./ResourceMarker";
import HeatmapOverlay from "./HeatmapOverlay";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, RotateCcw, Crosshair, Flame, Shield, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

// Custom marker icon for user location
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow-md"></div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Fix Leaflet marker icon issue
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  });
}

const isValidCoordinate = (coords: any): coords is [number, number] => {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lat, lng] = coords;
  return (
    lat !== null &&
    lng !== null &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

// Component to handle programmatically flying the map camera
function MapController() {
  const map = useMap();
  const selectedIncidentId = useSentinelStore((state) => state.selectedIncidentId);
  const incidents = useSentinelStore((state) => state.incidents);

  useEffect(() => {
    if (selectedIncidentId) {
      const inc = incidents.find((i) => i.id === selectedIncidentId);
      if (inc) {
        map.flyTo(inc.coordinates, 15, { duration: 1.5 });
      }
    }
  }, [selectedIncidentId, incidents, map]);

  return null;
}

// Map Controls Overlay component rendering within the map container context
function MapControls({
  showIncidents,
  setShowIncidents,
  showResources,
  setShowResources,
  showHeatmap,
  setShowHeatmap,
  userLocation,
  setUserLocation,
}: {
  showIncidents: boolean;
  setShowIncidents: (v: boolean) => void;
  showResources: boolean;
  setShowResources: (v: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
  userLocation: [number, number] | null;
  setUserLocation: (l: [number, number] | null) => void;
}) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        },
        (err) => {
          console.error("Error retrieving operator geolocation:", err);
        }
      );
    }
  };

  const handleResetView = () => {
    map.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 1.5 });
  };

  return (
    <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000] select-none">
      {/* Zoom Actions */}
      <div className="glass-panel rounded-lg flex flex-col overflow-hidden shadow-lg border border-white/10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-b border-white/5 cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="glass-panel rounded-lg flex flex-col overflow-hidden shadow-lg border border-white/10">
        <button
          onClick={handleLocateMe}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-b border-white/5 cursor-pointer"
          title="Locate Me"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle Overlays */}
      <div className="glass-panel rounded-lg flex flex-col overflow-hidden shadow-lg border border-white/10">
        {/* Toggle Heatmap */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={cn(
            "w-10 h-10 flex items-center justify-center border-b border-white/5 transition-colors cursor-pointer",
            showHeatmap ? "text-red-400 bg-red-500/10" : "text-white hover:bg-white/10"
          )}
          title="Toggle Heatmap"
        >
          <Flame className="w-4 h-4" />
        </button>

        {/* Toggle Incidents */}
        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={cn(
            "w-10 h-10 flex items-center justify-center border-b border-white/5 transition-colors cursor-pointer",
            showIncidents ? "text-amber-400 bg-amber-500/10" : "text-white hover:bg-white/10"
          )}
          title="Toggle Incidents"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>

        {/* Toggle Resources */}
        <button
          onClick={() => setShowResources(!showResources)}
          className={cn(
            "w-10 h-10 flex items-center justify-center transition-colors cursor-pointer",
            showResources ? "text-blue-400 bg-blue-500/10" : "text-white hover:bg-white/10"
          )}
          title="Toggle Resources"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function LiveMapInner() {
  // Bind database real-time listeners for updates
  useMapIncidents();
  useMapResources();

  const incidents = useSentinelStore((state) => state.incidents);
  const resources = useSentinelStore((state) => state.resources);
  const realtimeConnected = useSentinelStore((state) => state.realtimeConnected);
  const supabaseStatus = useSentinelStore((state) => state.supabaseStatus);
  const demoMode = useSentinelStore((state) => state.demoMode);

  // Console logging removed for production

  // Layer filters and camera states
  const [showIncidents, setShowIncidents] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Filter out resolved incidents for normal markers
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved");

  // Counter diagnostics
  const validIncidentsCount = activeIncidents.filter((inc) => isValidCoordinate(inc.coordinates)).length;
  const validResourcesCount = resources.filter(
    (res) => res.status !== "Maintenance" && isValidCoordinate(res.coordinates)
  ).length;
  const totalMarkersCount = validIncidentsCount + validResourcesCount;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map controller to fly camera to selected items */}
        <MapController />

        {/* Heatmap Layer */}
        <HeatmapOverlay incidents={incidents} active={showHeatmap} />

        {/* Render Incident Markers */}
        {showIncidents &&
          activeIncidents.map((inc) => {
            if (!isValidCoordinate(inc.coordinates)) return null;
            return <IncidentMarker key={inc.id} incident={inc} />;
          })}

        {/* Render Resource Markers */}
        {showResources &&
          resources.map((res) => {
            // Exclude maintenance units
            if (res.status === "Maintenance") return null;
            if (!isValidCoordinate(res.coordinates)) return null;
            return <ResourceMarker key={res.id} resource={res} />;
          })}

        {/* Render Dispatch Lines */}
        {showResources &&
          activeIncidents.map((inc) => {
            if (!isValidCoordinate(inc.coordinates)) return null;
            return inc.assignedResources?.map((resId) => {
              const res = resources.find((r) => r.id === resId);
              if (res && isValidCoordinate(res.coordinates)) {
                return (
                  <Polyline
                    key={`${inc.id}-${res.id}`}
                    positions={[inc.coordinates, res.coordinates]}
                    pathOptions={{
                      color: "#b4c5ff",
                      weight: 3,
                      dashArray: "6, 12",
                      className: "animate-pulse"
                    }}
                  />
                );
              }
              return null;
            });
          })}

        {/* Render User Location */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-xs text-white">Your Location</h4>
                <p className="text-[10px] text-white/60">Operator Command Center</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Diagnostics Panel Overlay (Hidden in Presentation Mode) */}
        {!demoMode && (
          <div className="absolute bottom-6 left-6 z-[1000] p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md text-white font-mono text-xs w-64 shadow-2xl flex flex-col gap-2 select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">
              <span className="font-extrabold uppercase tracking-wider text-primary">Map Diagnostics</span>
              <span className={cn("h-2 w-2 rounded-full animate-pulse", realtimeConnected ? "bg-emerald-500" : "bg-rose-500")}></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Map Loaded:</span>
              <span className="text-emerald-400 font-bold">Yes (Active)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Incidents Count:</span>
              <span className="text-white font-bold">{incidents.length} ({activeIncidents.length} active)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Resources Count:</span>
              <span className="text-white font-bold">{resources.length} ({resources.filter(r => r.status === 'Available').length} available)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Realtime Connected:</span>
              <span className={cn("font-bold", realtimeConnected ? "text-emerald-400" : "text-rose-400")}>
                {realtimeConnected ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Marker Count:</span>
              <span className="text-white font-bold">{totalMarkersCount} rendered</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Supabase Status:</span>
              <span className={cn(
                "font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded",
                supabaseStatus === "connected"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : supabaseStatus === "disconnected"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              )}>
                {supabaseStatus}
              </span>
            </div>
          </div>
        )}

        {/* Map Floating Control Overlay Panel */}
        <MapControls
          showIncidents={showIncidents}
          setShowIncidents={setShowIncidents}
          showResources={showResources}
          setShowResources={setShowResources}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
        />
      </MapContainer>
    </div>
  );
}
