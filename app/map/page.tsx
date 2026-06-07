import LiveMap from "@/components/map/LiveMap";
import Timeline from "@/components/map/Timeline";
import DispatchOverlay from "@/components/map/DispatchOverlay";

export default function MapPage() {
  return (
    <div className="flex-1 flex h-full w-full relative overflow-hidden bg-background">
      {/* 1. Left Sidebar - Live Scrolling Timeline (320px wide) */}
      <div className="w-80 h-full shrink-0 hidden md:block z-10">
        <Timeline />
      </div>

      {/* 2. Main Map Canvas Container */}
      <div className="flex-1 h-full relative z-0">
        <LiveMap />

        {/* 3. Bottom-Right Dispatch Overlay Card (320px wide) */}
        <div className="absolute bottom-6 right-6 w-80 z-[1000]">
          <DispatchOverlay />
        </div>
      </div>
    </div>
  );
}
