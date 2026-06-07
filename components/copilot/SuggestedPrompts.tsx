"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  prompts: { text: string; query: string }[];
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export default function SuggestedPrompts({
  prompts,
  onSelect,
  disabled,
}: SuggestedPromptsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt.text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          onClick={() => !disabled && onSelect(prompt.query)}
          disabled={disabled}
          className="flex items-center gap-1.5 border border-outline-variant/40 bg-surface-container-lowest/70 hover:bg-primary/10 hover:border-primary/30 text-on-surface-variant hover:text-primary rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none group"
        >
          <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          {prompt.text}
        </motion.button>
      ))}
    </div>
  );
}
