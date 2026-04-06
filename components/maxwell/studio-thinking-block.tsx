"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import { siteTones } from "@/lib/site-tones";

type StudioThinkingBlockProps = {
  content: string;
};

/**
 * Displays Maxwell's internal reasoning as a collapsible block.
 * Visible to the user as a sign that Maxwell is processing deeply,
 * not just pattern-matching.
 */
export function StudioThinkingBlock({ content }: StudioThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex justify-start">
      {/* Left icon gutter — aligns with assistant messages */}
      <div className="w-7 shrink-0 mr-3" />

      <div
        className="w-full max-w-[80%] rounded-xl overflow-hidden border text-xs"
        style={{
          borderColor: siteTones.data.border,
          backgroundColor: siteTones.data.surface,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 transition-opacity hover:opacity-80"
          style={{ color: siteTones.data.accent }}
        >
          <Brain className="w-3 h-3 shrink-0" />
          <span className="font-mono flex-1 text-left">Maxwell thinking</span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 shrink-0" />
          ) : (
            <ChevronDown className="w-3 h-3 shrink-0" />
          )}
        </button>

        {expanded && (
          <div
            className="px-3 pb-3 font-mono leading-relaxed whitespace-pre-wrap border-t"
            style={{
              color: siteTones.data.accent,
              borderColor: siteTones.data.border,
              opacity: 0.8,
            }}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
