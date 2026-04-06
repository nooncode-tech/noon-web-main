"use client";

import { Loader2 } from "lucide-react";
import { siteTones } from "@/lib/site-tones";
import type { StudioPhase } from "./studio-shell";

type StudioCorrectionBarProps = {
  phase: StudioPhase;
  versionNumber: number;
  correctionsUsed: number;
  maxCorrections: number;
};

export function StudioCorrectionBar({
  phase,
  versionNumber,
  correctionsUsed,
  maxCorrections,
}: StudioCorrectionBarProps) {
  const isRevising = phase === "revision_requested";
  const allUsed = correctionsUsed >= maxCorrections;
  const remaining = maxCorrections - correctionsUsed;

  const tone = allUsed ? siteTones.services : siteTones.brand;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-t border-b text-xs"
      style={{ backgroundColor: tone.surface, borderColor: tone.border }}
    >
      {/* Version badge */}
      <span
        className="font-mono rounded-md px-2 py-0.5 shrink-0"
        style={{ backgroundColor: tone.border, color: tone.accent }}
      >
        v{versionNumber}
      </span>

      {/* Dot indicators */}
      <div className="flex items-center gap-1 shrink-0">
        {Array.from({ length: maxCorrections }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < correctionsUsed ? tone.accent : tone.border }}
          />
        ))}
      </div>

      {/* Status label */}
      <span
        className="flex-1 min-w-0 truncate"
        style={{ color: tone.accent }}
      >
        {isRevising ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin inline" />
            Applying adjustment...
          </span>
        ) : allUsed ? (
          "Adjustments complete"
        ) : (
          `${remaining} adjustment${remaining === 1 ? "" : "s"} remaining`
        )}
      </span>
    </div>
  );
}
