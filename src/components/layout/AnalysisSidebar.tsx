"use client";

import {
  LayoutDashboard, BarChart2, TrendingUp, FileText,
  Users, PieChart, Newspaper,
} from "lucide-react";
import type { TabId } from "@/types";

const items: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "fundamentals", label: "Fundamentals", icon: BarChart2 },
  { id: "technicals", label: "Technicals", icon: TrendingUp },
  { id: "financials", label: "Financials", icon: FileText },
  { id: "peers", label: "Peers", icon: Users },
  { id: "shareholding", label: "Shareholding", icon: PieChart },
  { id: "news", label: "News", icon: Newspaper },
];

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function AnalysisSidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-[200px] shrink-0 py-4 gap-1"
      style={{
        position: "fixed",
        top: "56px",
        left: 0,
        bottom: 0,
        width: "200px",
        backgroundColor: "var(--surface-1)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        zIndex: 30,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`sidebar-item w-full text-left ${isActive ? "active" : ""}`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
