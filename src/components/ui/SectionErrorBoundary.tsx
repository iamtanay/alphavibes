// src/components/ui/SectionErrorBoundary.tsx
// Wrap each analysis tab section in this boundary.
// If data is malformed or a render throws, the section shows a friendly
// "Data unavailable" message instead of crashing the whole page.

"use client";

import React from "react";
import { RefreshCcw, AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Section title shown in the fallback UI */
  title?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev — swap for a real error reporting service in prod
    if (process.env.NODE_ENV !== "production") {
      console.error(`[SectionErrorBoundary] ${this.props.title ?? "Section"} failed:`, error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            minHeight: 160,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
          >
            <AlertCircle size={20} style={{ color: "var(--danger)" }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {this.props.title ? `${this.props.title} unavailable` : "Data unavailable"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              This section couldn&apos;t load for this stock.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--surface-3)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <RefreshCcw size={12} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
