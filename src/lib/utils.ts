// lib/utils.ts — Shared utility functions

/** Format a number in Indian notation: 9,45,616 → ₹9.45 L Cr */
export function formatIndianCurrency(value: number, unit: "cr" | "raw" = "raw"): string {
  if (unit === "cr") {
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L Cr`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K Cr`;
    return `₹${value.toFixed(2)} Cr`;
  }
  // Indian comma formatting
  const str = Math.abs(value).toFixed(2);
  const [intPart, decimal] = str.split(".");
  let result = "";
  const n = intPart.length;
  for (let i = 0; i < n; i++) {
    if (i === n - 3 && n > 3) result += ",";
    else if (i > n - 3 && (n - i - 1) % 2 === 0 && i !== 0 && i !== n - 3) result += ",";
    result += intPart[i];
  }
  return `₹${result}.${decimal}`;
}

/** Format market cap in L Cr shorthand */
export function formatMarketCap(crores: number): string {
  if (crores >= 100000) return `₹${(crores / 100000).toFixed(2)} L Cr`;
  if (crores >= 1000) return `₹${(crores / 1000).toFixed(0)}K Cr`;
  return `₹${crores.toFixed(0)} Cr`;
}

/** Format a % change with + or - prefix */
export function formatChange(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/** Return Tailwind color class based on a numeric change */
export function changeColor(value: number): string {
  return value >= 0 ? "text-success" : "text-danger";
}

/** Map a verdict/signal string to a Tailwind color class */
export function signalColor(signal: string): string {
  switch (signal?.toLowerCase()) {
    case "bullish":
    case "strong match":
    case "good":
      return "text-success";
    case "bearish":
    case "weak match":
    case "poor match":
    case "expensive":
      return "text-danger";
    case "neutral":
    case "caution":
      return "text-warning";
    default:
      return "text-text-secondary";
  }
}

/** Map a rating to a badge variant */
export function ratingBadgeVariant(rating: string): "success" | "warning" | "danger" | "neutral" {
  switch (rating?.toLowerCase()) {
    case "good":
    case "low":
      return "success";
    case "fair":
      return "warning";
    case "high":
    case "poor":
      return "danger";
    default:
      return "neutral";
  }
}

/** Map a verdictColor to badge variant */
export function verdictToVariant(verdictColor: string): "success" | "warning" | "danger" | "info" {
  switch (verdictColor) {
    case "success": return "success";
    case "warning": return "warning";
    case "danger": return "danger";
    default: return "info";
  }
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a number with compact suffix: 10000000 → 1Cr, 1000 → 1K */
export function formatCompact(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}
