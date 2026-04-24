// src/components/ui/Tooltip.tsx
// Lightweight tooltip component used on every ratio and indicator.
// Shows an (i) icon that reveals a tooltip on hover (desktop) or tap (mobile).
// No external library — pure CSS + React state.

"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  /** Short explanation of what the metric is */
  what: string;
  /** The value in context, e.g. "28.4x vs sector avg 22x" */
  context?: string;
  /** What it means for this specific stock */
  implication?: string;
  /** Icon size (default 13) */
  size?: number;
}

export function Tooltip({ what, context, implication, size = 13 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        aria-label="More info"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          background: "none",
          border: "none",
          padding: "0 2px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          color: "var(--text-tertiary)",
          transition: "color 0.15s",
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info size={size} />
      </button>

      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            width: 240,
            borderRadius: 10,
            padding: "10px 12px",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            pointerEvents: "none",
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              backgroundColor: "var(--surface-2)",
              borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
            }}
          />
          <p style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, marginBottom: context || implication ? 6 : 0 }}>
            {what}
          </p>
          {context && (
            <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: implication ? 4 : 0 }}>
              {context}
            </p>
          )}
          {implication && (
            <p style={{ fontSize: 11, color: "var(--violet)", lineHeight: 1.5 }}>
              {implication}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Convenience wrapper: label + tooltip inline ─────────────────────────── */
interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  context?: string;
  implication?: string;
  className?: string;
}

export function LabelWithTooltip({ label, tooltip, context, implication, className }: LabelWithTooltipProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {label}
      <Tooltip what={tooltip} context={context} implication={implication} />
    </span>
  );
}

export default Tooltip;
