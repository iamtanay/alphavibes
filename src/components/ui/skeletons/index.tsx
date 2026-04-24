// src/components/ui/skeletons/index.tsx
// Shape-matched skeleton loaders for every major section.
// Each skeleton mirrors the exact layout of the real content so perceived
// load time feels instant even before data arrives.

"use client";

/* ── Base pulse block ────────────────────────────────────────────────────── */
function Pulse({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ borderRadius: 8, ...style }}
    />
  );
}

/* ── Persona cards row ───────────────────────────────────────────────────── */
export function PersonasSkeleton() {
  return (
    <div>
      <Pulse style={{ width: 140, height: 16, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 12, overflowX: "hidden" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 160,
              minWidth: 160,
              borderRadius: 16,
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <Pulse style={{ width: 56, height: 56, borderRadius: "50%" }} />
            <Pulse style={{ width: 100, height: 12 }} />
            <Pulse style={{ width: 72, height: 10 }} />
            <Pulse style={{ width: 52, height: 52, borderRadius: "50%" }} />
            <Pulse style={{ width: 64, height: 10 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Key ratios 2×3 grid ─────────────────────────────────────────────────── */
export function RatiosSkeleton() {
  return (
    <div>
      <Pulse style={{ width: 120, height: 16, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              padding: "12px 14px",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <Pulse style={{ width: "60%", height: 10, marginBottom: 8 }} />
            <Pulse style={{ width: "80%", height: 18, marginBottom: 6 }} />
            <Pulse style={{ width: "50%", height: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Chart rectangle ─────────────────────────────────────────────────────── */
export function ChartSkeleton() {
  return (
    <div>
      <Pulse style={{ width: 180, height: 16, marginBottom: 12 }} />
      <Pulse style={{ width: "100%", height: 220, borderRadius: 12 }} />
    </div>
  );
}

/* ── Financials table ────────────────────────────────────────────────────── */
export function FinancialTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <Pulse style={{ width: 150, height: 16, marginBottom: 12 }} />
      {/* header row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Pulse style={{ flex: 2, height: 12 }} />
        {[1, 2, 3, 4, 5].map((i) => <Pulse key={i} style={{ flex: 1, height: 12 }} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Pulse style={{ flex: 2, height: 14 }} />
          {[1, 2, 3, 4, 5].map((j) => <Pulse key={j} style={{ flex: 1, height: 14 }} />)}
        </div>
      ))}
    </div>
  );
}

/* ── Shareholding donut + table ──────────────────────────────────────────── */
export function ShareholdingSkeleton() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Pulse style={{ width: 140, height: 140, borderRadius: "50%" }} />
        <Pulse style={{ width: 100, height: 10 }} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            <Pulse style={{ width: 12, height: 12, borderRadius: "50%" }} />
            <Pulse style={{ flex: 1, height: 12 }} />
            <Pulse style={{ width: 50, height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Peers table ─────────────────────────────────────────────────────────── */
export function PeersSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <Pulse style={{ width: 120, height: 16, marginBottom: 12 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
          <Pulse style={{ width: 40, height: 40, borderRadius: 8 }} />
          <Pulse style={{ flex: 2, height: 14 }} />
          {[1, 2, 3, 4].map((j) => <Pulse key={j} style={{ flex: 1, height: 14 }} />)}
        </div>
      ))}
    </div>
  );
}

/* ── Generic section skeleton (quick summary cards) ─────────────────────── */
export function SummarySkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: 12,
            padding: "12px 14px",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <Pulse style={{ width: "55%", height: 10, marginBottom: 8 }} />
          <Pulse style={{ width: "75%", height: 16 }} />
        </div>
      ))}
    </div>
  );
}

/* ── Full overview tab skeleton ──────────────────────────────────────────── */
export function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SummarySkeleton />
      <PersonasSkeleton />
      <ChartSkeleton />
    </div>
  );
}

/* ── Full analysis page skeleton (before quote loads) ───────────────────── */
export function PageHeaderSkeleton() {
  return (
    <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-1)" }}>
      <Pulse style={{ width: 200, height: 22, marginBottom: 8 }} />
      <Pulse style={{ width: 100, height: 12, marginBottom: 12 }} />
      <Pulse style={{ width: 160, height: 30 }} />
    </div>
  );
}
