"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import SuggestedPrompts from "./SuggestedPrompts";
import { SUGGESTED_PROMPTS } from "@/copilot/prompts";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
  toolUsed?: string | null;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: data.answer || "No response from the copilot engine.",
        timestamp: data.timestamp || new Date().toISOString(),
        confidence: data.confidence,
        sources: data.sources,
        toolUsed: data.toolUsed,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Copilot chat error:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: "Neural uplink disrupted. Failed to reach the copilot inference engine. Retrying may resolve the issue.",
        timestamp: new Date().toISOString(),
        confidence: 0,
        sources: [],
        toolUsed: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-background/40 relative">
      {/* Ambient glow decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-[0.03] z-0">
        <div className="w-[600px] h-[600px] bg-primary rounded-full blur-[140px]" />
      </div>

      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 no-scrollbar">
        {/* Session Badge */}
        <div className="flex justify-center">
          <span className="text-[10px] font-bold text-outline/80 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/20 uppercase tracking-widest font-mono-data">
            Secure Neural Uplink • AI Copilot Active
          </span>
        </div>

        {/* Welcome Message */}
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 gap-5 select-none"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-on-surface mb-1.5">
                Sentinel AI Copilot
              </h2>
              <p className="text-sm text-on-surface-variant/70 max-w-md leading-relaxed">
                I have real-time access to all incidents, resources, alerts, and
                AI predictions. Ask me anything about the operational status.
              </p>
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              id={msg.id}
              sender={msg.sender}
              text={msg.text}
              timestamp={msg.timestamp}
              confidence={msg.confidence}
              sources={msg.sources}
              toolUsed={msg.toolUsed}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full justify-start"
          >
            <div className="flex gap-3.5">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary/20 text-primary flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 animate-spin" style={{ animationDuration: "2s" }} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-outline font-mono-data">
                  Sentinel Copilot
                </span>
                <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-outline/80 animate-pulse font-mono-data">
                    Processing telemetry...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 pb-4 z-10 w-full overflow-hidden select-none">
        <SuggestedPrompts
          prompts={SUGGESTED_PROMPTS}
          onSelect={handleSend}
          disabled={loading}
        />
      </div>

      {/* Input Bar */}
      <div className="p-4.5 border-t border-outline-variant/20 bg-surface-container/20 backdrop-blur-xl z-20 shadow-[0_-8px_25px_rgba(0,0,0,0.2)]">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-2 focus-within:border-primary/50 transition-all shadow-inner">
          <button className="p-2 text-outline hover:text-primary transition-colors rounded-xl shrink-0 cursor-pointer">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Query Sentinel AI regarding active vectors or units..."
            rows={1}
            className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder:text-outline/70 focus:outline-none resize-none py-2 px-1 max-h-32 min-h-[36px] overflow-y-auto no-scrollbar font-sans"
          />
          <div className="flex items-center gap-1.5 shrink-0 pb-1">
            <button className="p-2 text-outline hover:text-primary transition-colors rounded-xl cursor-pointer">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-primary text-on-primary hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors rounded-xl shadow-[0_0_15px_rgba(180,197,255,0.2)] flex items-center justify-center w-10 h-10 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
        <div className="text-center mt-3 select-none">
          <span className="text-[10px] font-mono-data text-outline/50 tracking-widest uppercase">
            Secure Telemetry Connection • Gemini 2.5 Flash
          </span>
        </div>
      </div>
    </section>
  );
}
