"use client";

import ChatWindow from "@/components/copilot/ChatWindow";
import ContextPanel from "@/components/copilot/ContextPanel";

export default function CopilotPage() {
  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* 1. Main Chat Interface */}
      <ChatWindow />

      {/* 2. Right Side Panel: Live Context */}
      <ContextPanel />
    </div>
  );
}
