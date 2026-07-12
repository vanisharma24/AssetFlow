"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Wrench, 
  Clock, 
  Calendar, 
  Building,
  Activity,
  FileText,
  ShieldAlert,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

// ─── Constants & Coherent Mock Data (100% Consistent) ─────────────────────────

// Current date base for "Today" as reference: July 12, 2026
const REPORT_DATE = "July 12, 2026";

// Section 2: Key Metrics
const KEY_METRICS = {
  totalAssets: 1248,
  overallUtilization: "78.4%",
  allocatedAssets: 978,
  idleAssets: 42,
  maintenanceDue30d: 18,
  retirementNearing: 11,
  totalBookings: 3840,
  momChange: "+2.4%"
};

// Section 3: Utilization by Department
const DEPT_UTILIZATION = [
  { name: "HR", total: 110, active: 68, pct: 61.8, trend: "down" as const },
  { name: "IT", total: 420, active: 374, pct: 89.0, trend: "up" as const },
  { name: "Operations", total: 380, active: 312, pct: 82.1, trend: "up" as const },
  { name: "Facilities", total: 85, active: 48, pct: 56.4, trend: "down" as const },
  { name: "Logistics", total: 145, active: 128, pct: 88.2, trend: "up" as const },
  { name: "Sales", total: 68, active: 40, pct: 58.8, trend: "down" as const },
  { name: "Marketing", total: 40, active: 8, pct: 20.0, trend: "down" as const }
];

// Section 4: Maintenance Frequency Analysis
const MAINTENANCE_ANALYSIS = [
  { id: "AF-TRK-09", name: "Heavy Duty Forklift", count: 8, avgDays: 22, cost: 4200, dept: "Logistics" },
  { id: "AF-VAN-03", name: "Delivery Van Transit", count: 6, avgDays: 30, cost: 3500, dept: "Logistics" },
  { id: "AF-PRN-12", name: "Enterprise Plotter Printer", count: 5, avgDays: 36, cost: 1850, dept: "Facilities" },
  { id: "AF-SRV-22", name: "Rack Server Pro Node-B", count: 4, avgDays: 45, cost: 2400, dept: "IT" },
  { id: "AF-AC-041", name: "Server Room Cooling HVAC 1", count: 4, avgDays: 45, cost: 3100, dept: "Facilities" }
];

// Predictive alerts subsection
const PREDICTIVE_ALERTS = [
  { id: "AF-HVAC-02", name: "Main Office HVAC Unit B", daysDue: 7, priority: "High" as const, dept: "Facilities" },
  { id: "AF-GEN-01", name: "Emergency Power Generator A", daysDue: 15, priority: "Medium" as const, dept: "Operations" },
  { id: "AF-TRK-10", name: "Reach Truck Lift E", daysDue: 30, priority: "Low" as const, dept: "Logistics" }
];

// Section 5: Most Used Assets (Top 5)
const MOST_USED_ASSETS = [
  { id: "AF-CONF-B2", name: "Boardroom B2 (Interactive Wall)", usage: 84, dept: "HR / Corporate", avgDuration: "2.8 hrs" },
  { id: "AF-VAN-343", name: "EV Courier Van 343", usage: 76, dept: "Logistics", avgDuration: "6.5 hrs" },
  { id: "AF-PROJ-335", name: "4K Laser Projector Room 335", usage: 62, dept: "Marketing", avgDuration: "1.5 hrs" },
  { id: "AF-WS-102", name: "Hot-Desk Workstation 102", usage: 58, dept: "IT / Shared", avgDuration: "8.2 hrs" },
  { id: "AF-CAM-08", name: "4K Cinema Camera Rig 08", usage: 44, dept: "Marketing", avgDuration: "4.0 hrs" }
];

// Section 6: Idle Assets (Bottom 5)
const IDLE_ASSETS = [
  { id: "AF-TAB-88", name: "Tablet Pro 12.9 (Batch H)", days: 92, loc: "Marketing Depository", cond: "Good", action: "Reassign to Sales" },
  { id: "AF-PRJ-08", name: "Portable LED Projector Slim", days: 78, loc: "Sales Storage Bin C", cond: "Fair", action: "Sell Surplus" },
  { id: "AF-LAP-334", name: "Legacy Core i5 Laptop 334", days: 65, loc: "IT IT-Recycle Stack", cond: "Poor", action: "Retire / Recycle" },
  { id: "AF-BIK-05", name: "Cargo Logistics Electric Bike 05", days: 48, loc: "Logistics Loading Dock 2", cond: "Fair", action: "Inspect / Maintenance" },
  { id: "AF-WS-19", name: "Standing Desk Frame Prototype 19", days: 35, loc: "HR Flex Space", cond: "Good", action: "Reassign to IT" }
];

// Section 7: Assets Due / Nearing Retirement
const DUE_AND_RETIREMENT = [
  { id: "AF-LAP-334", name: "Legacy Core i5 Laptop 334", age: "5.2 yrs", dueIn: 0, cond: "Poor" as const, priority: "High" as const, action: "Retire & Dispose" },
  { id: "AF-HVAC-02", name: "Main Office HVAC Unit B", age: "8.1 yrs", dueIn: 7, cond: "Fair" as const, priority: "High" as const, action: "Immediate Overhaul" },
  { id: "AF-GEN-01", name: "Emergency Power Generator A", age: "6.5 yrs", dueIn: 15, cond: "Good" as const, priority: "Medium" as const, action: "Scheduled Routine Service" },
  { id: "AF-TRK-10", name: "Reach Truck Lift E", age: "4.8 yrs", dueIn: 30, cond: "Fair" as const, priority: "Low" as const, action: "Regular Lubrication & Check" },
  { id: "AF-PRN-05", name: "Warehouse Thermal Printer 05", age: "5.0 yrs", dueIn: 45, cond: "Poor" as const, priority: "Medium" as const, action: "Procure Replacement / Retire" }
];

// Section 8: Booking Heatmap
const HEATMAP_HOURS = ["6-8", "8-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_GRID: Record<string, number[]> = {
  Mon: [12, 45, 68, 55, 72, 59, 28, 14],
  Tue: [18, 52, 78, 62, 85, 66, 35, 16],
  Wed: [15, 49, 74, 58, 80, 68, 30, 15],
  Thu: [20, 55, 82, 65, 88, 70, 38, 18],
  Fri: [14, 42, 60, 48, 65, 50, 22, 10],
  Sat: [4,  10, 18, 22, 25, 18, 12, 5],
  Sun: [2,  6,  12, 15, 14, 10,  8, 3]
};

// Section 9: Recommendations
const RECOMMENDATIONS = [
  {
    title: "1. Optimize Marketing & Facilities Allocations",
    type: "optimization",
    desc: "Marketing currently registers an extremely low asset utilization of 20% (only 8 of 40 assets in use). Reallocate surplus displays, tablets, and media gear directly to the IT or Sales departments to avoid redundant procurement costs.",
    impact: "High Impact · Saves approx. $12,000 in upcoming Q3 purchases",
    icon: Building,
    color: "emerald"
  },
  {
    title: "2. Transition Logistics Assets to Predictive Schedule",
    type: "maintenance",
    desc: "Heavy Duty Forklift (AF-TRK-09) and Delivery Van (AF-VAN-03) average less than 30 days between servicing, totaling $7,700 in 6 months. Shift these high-usage assets from standard intervals to run-time based predictive maintenance to save scheduling overhead.",
    impact: "Medium Impact · Reduces downtime by 14%",
    icon: Wrench,
    color: "purple"
  },
  {
    title: "3. Swift Resolution for Aged and Idle Assets",
    type: "idle",
    desc: "Immediately decommission Legacy Laptop (AF-LAP-334) which is 5.2 years old, rated Poor, and has sat idle for 65 days. Move the Tablet Pro batch from Marketing depository storage to the field Sales agents.",
    impact: "High Impact · Frees up security license seats and hardware value",
    icon: Clock,
    color: "amber"
  },
  {
    title: "4. Proactive Replacement Plan for Near-Retirement Assets",
    type: "procurement",
    desc: "Formulate a replacement procurement schedule for Main Office HVAC Unit B (AF-HVAC-02) and Warehouse Thermal Printer (AF-PRN-05), which are nearing the end of their operational lifespans and showing deteriorated conditions.",
    impact: "High Impact · Eliminates sudden operational disruption risk",
    icon: ShieldAlert,
    color: "red"
  },
  {
    title: "5. Implement Peak-Hour Flex Reservation Policy",
    type: "policy",
    desc: "The booking heatmap reveals extreme resource congestion on mid-week mornings (Tuesdays/Thursdays, 10 AM - 12 PM and 2 PM - 4 PM). Introduce slot caps for non-essential department bookings to balance load to low-demand Monday/Friday slots.",
    impact: "Medium Impact · Smooths asset booking availability rate",
    icon: Calendar,
    color: "info"
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const triggerDownload = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── Component Implementation ────────────────────────────────────────────────

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "utilization" | "maintenance" | "idle" | "export">("overview");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [genTime, setGenTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setGenTime(new Date().toUTCString());
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Papaparse dynamic CSV generators
  const exportDepartmentCSV = () => {
    const data = DEPT_UTILIZATION.map(d => ({
      Department: d.name,
      "Total Assets": d.total,
      "Assets in Use": d.active,
      "Utilization %": d.pct.toFixed(1),
      Trend: d.trend === "up" ? "Increasing" : "Decreasing"
    }));
    const csv = Papa.unparse(data);
    triggerDownload(csv, `department_utilization_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportMaintenanceCSV = () => {
    const data = MAINTENANCE_ANALYSIS.map(m => ({
      "Asset ID": m.id,
      "Asset Name": m.name,
      "Maintenance Count (6 mo)": m.count,
      "Avg Days Between Services": m.avgDays,
      "Total Cost (USD)": m.cost,
      Department: m.dept
    }));
    const csv = Papa.unparse(data);
    triggerDownload(csv, `maintenance_frequency_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportIdleAssetsCSV = () => {
    const data = IDLE_ASSETS.map(i => ({
      "Asset ID": i.id,
      "Asset Name": i.name,
      "Days Idle": i.days,
      "Last Known Location": i.loc,
      Condition: i.cond,
      "Recommended Action": i.action
    }));
    const csv = Papa.unparse(data);
    triggerDownload(csv, `idle_assets_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAllToCSV = () => {
    // Generate combined metadata report structure using Papa.unparse
    const meta = [
      { "Report Name": "AssetFlow Executive Asset Management Report", Value: "" },
      { "Report Date": REPORT_DATE, Value: "" },
      { "Total Registered Assets": KEY_METRICS.totalAssets, Value: "" },
      { "Overall Utilization Rate": KEY_METRICS.overallUtilization, Value: "" },
      { "Idle Assets (>30 days)": KEY_METRICS.idleAssets, Value: "" },
      { "Due Maintenance": KEY_METRICS.maintenanceDue30d, Value: "" }
    ];
    
    const metaCsv = Papa.unparse(meta) + "\n\n";
    
    const deptData = DEPT_UTILIZATION.map(d => ({
      Department: d.name,
      "Total Assets": d.total,
      "Assets in Use": d.active,
      "Utilization %": d.pct.toFixed(1)
    }));
    const deptCsv = "--- DEPARTMENT UTILIZATION ---\n" + Papa.unparse(deptData) + "\n\n";

    const maintData = MAINTENANCE_ANALYSIS.map(m => ({
      "Asset ID": m.id,
      "Asset Name": m.name,
      "Maintenance Count": m.count,
      "Total Cost": m.cost
    }));
    const maintCsv = "--- MAINTENANCE FREQUENCY ---\n" + Papa.unparse(maintData) + "\n\n";

    const idleData = IDLE_ASSETS.map(i => ({
      "Asset ID": i.id,
      "Asset Name": i.name,
      "Days Idle": i.days,
      "Recommended Action": i.action
    }));
    const idleCsv = "--- IDLE ASSETS BOTTOM PERFORMERS ---\n" + Papa.unparse(idleData);

    const combinedCsv = metaCsv + deptCsv + maintCsv + idleCsv;
    triggerDownload(combinedCsv, `assetflow_full_executive_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#374151] font-sans antialiased pb-24">
      
      {/* ─── Navigation Header (Matches provided UI system) ──────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md shadow-[#10B981]/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="font-bold text-xl text-[#111827] tracking-tight">AssetFlow</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-[#111827]">Overview</a>
              <a href="#" className="text-sm font-medium text-[#9CA3AF] hover:text-[#374151] transition-colors">Assets</a>
              <a href="#" className="text-sm font-medium text-[#9CA3AF] hover:text-[#374151] transition-colors">Workflows</a>
              <a href="#" className="text-sm font-medium text-[#9CA3AF] hover:text-[#374151] transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={exportAllToCSV}
              className="flex items-center gap-2 border-none bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-[#10B981]/15 hover:shadow-[#10B981]/25 hover:scale-[1.02] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export Full CSV (PapaParse)</span>
            </button>
            <div className="h-9 w-9 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-semibold text-sm border border-[#10B981]/20">
              AI
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content Wrapper ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Page Title & Meta */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E7EB] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="bg-[#E8FBF2] text-[#059669] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#D1FAE5]">
                AI-Powered Insight
              </span>
              <span className="text-xs text-[#9CA3AF]">Updated daily</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Executive Asset Management Report</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Comprehensive performance analysis, audit compliance status, and optimization recommendations.
            </p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <span className="text-xs text-[#9CA3AF] block font-medium">REPORT GENERATION</span>
            <span className="text-sm font-semibold text-[#374151] block">{REPORT_DATE}</span>
            <span className="text-xs text-[#9CA3AF] block">AssetFlow Analytics Portal v2.4</span>
          </div>
        </div>

        {/* ─── Tabs Navigation ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] mb-8 overflow-x-auto pb-px scrollbar-none">
          <div className="flex gap-2 min-w-max">
            {[
              { id: "overview", label: "Executive Overview", count: null },
              { id: "utilization", label: "Utilization & Departments", count: "7 Departments" },
              { id: "maintenance", label: "Maintenance & Lifespans", count: "18 Due" },
              { id: "idle", label: "Idle & Bottom Performers", count: "42 Idle" },
              { id: "export", label: "Export Raw Data", count: "CSV" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-[#10B981] text-[#10B981]"
                    : "border-transparent text-[#9CA3AF] hover:text-[#374151] hover:border-[#D1D5DB]"
                )}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full font-medium",
                    activeTab === tab.id 
                      ? "bg-[#ECFDF5] text-[#059669]" 
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB CONTENT: OVERVIEW ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECTION 2: KEY METRICS AT A GLANCE (Stats Card grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              {/* Stat Card 1 */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Total Registered</span>
                  <div className="h-8 w-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#111827]">{KEY_METRICS.totalAssets}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-medium text-[#9CA3AF]">Active Items Portfolio</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#10B981] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Avg Utilization</span>
                  <div className="h-8 w-8 rounded-lg bg-[#E8FBF2] text-[#10B981] flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#111827]">{KEY_METRICS.overallUtilization}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-0.5">
                    {KEY_METRICS.momChange}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">MoM change</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#10B981] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Idle {`(>30 days)`}</span>
                  <div className="h-8 w-8 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#111827]">{KEY_METRICS.idleAssets}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-[#D97706]">
                    {((KEY_METRICS.idleAssets / KEY_METRICS.totalAssets) * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-[#9CA3AF]">of total portfolio</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F59E0B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Due Maintenance</span>
                  <div className="h-8 w-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
                    <Wrench className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#111827]">{KEY_METRICS.maintenanceDue30d}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-[#DC2626]">High Priority</span>
                  <span className="text-xs text-[#9CA3AF]">next 30 days</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EF4444] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>

            </div>

            {/* SECTION 1: EXECUTIVE SUMMARY */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8">
              <h2 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#10B981]" />
                <span>Section 1: Executive Summary & Performance Appraisal</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4 text-[#475569] text-base leading-relaxed">
                  <p>
                    AssetFlow's operational portfolio reports an average resource utilization of <strong>{KEY_METRICS.overallUtilization}</strong> for the current billing cycle ending <strong>{REPORT_DATE}</strong>. This reflects a steady and positive expansion of <strong>{KEY_METRICS.momChange}</strong> month-over-month. The gain is primarily propelled by heavy workload cycles in the IT (89%) and Logistics (88.2%) business units, which have maintained highly consolidated asset footprints due to infrastructure upgrades and expanded regional shipping channels.
                  </p>
                  <p>
                    However, underlying operations face distinct efficiency losses. Key concerns include a lingering maintenance backlog containing <strong>{KEY_METRICS.maintenanceDue30d} assets</strong> scheduled for critical service in the next 30 days, alongside <strong>{KEY_METRICS.idleAssets} idle assets</strong> left unused for over 30 days. Unmitigated, these idle assets correspond to roughly 3.4% of active capital value lying unassigned, heavily concentrated in the Marketing (20% utilization) and Facilities departments.
                  </p>
                  <p>
                    Furthermore, <strong>{KEY_METRICS.retirementNearing} units</strong> are rapidly nearing operational retirement within the current quarter. A planned transition policy must be executed to replace vulnerable cooling systems and legacy logistics fleet units before wear-and-tear drives unforeseen downtime. Implementing the recommended department reassignments and preventative maintenance strategies outlined in this report will secure stable operations.
                  </p>
                </div>
                
                {/* Takeaways Sidebar */}
                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                  <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4 text-[#0F172A]">
                    Top 3 Leadership Takeaways
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8FBF2] text-[#059669] font-bold text-xs">
                        1
                      </div>
                      <p className="text-sm text-[#475569] leading-normal">
                        <strong>Logistics Optimization:</strong> Reallocate surplus assets from Marketing to Operations and Sales to resolve the 20% utilization floor.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8FBF2] text-[#059669] font-bold text-xs">
                        2
                      </div>
                      <p className="text-sm text-[#475569] leading-normal">
                        <strong>Preventative Focus:</strong> Transition high-frequency warehouse forklifts and delivery vehicles to dynamic usage-based maintenance cycles to prevent costly breakdown peaks.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8FBF2] text-[#059669] font-bold text-xs">
                        3
                      </div>
                      <p className="text-sm text-[#475569] leading-normal">
                        <strong>Lifecycle Replacement:</strong> Establish priority procurement schedules for critical facility assets nearing age thresholds (e.g. HVAC Unit B).
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 9: RECOMMENDATIONS (Overview Tab Highlight) */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#10B981]" />
                  <span>Section 9: Actionable Recommendations</span>
                </h2>
                <span className="text-xs text-[#9CA3AF] font-medium hidden md:inline">5 Data-Backed Policies</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RECOMMENDATIONS.map((rec, i) => {
                  const Icon = rec.icon;
                  return (
                    <div 
                      key={i} 
                      className="border border-[#E5E7EB] hover:border-[#10B981]/50 rounded-2xl p-5 bg-[#FAFAFA]/50 hover:bg-white transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3.5">
                          <div className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center",
                            rec.color === "emerald" ? "bg-[#ECFDF5] text-[#059669]" :
                            rec.color === "purple" ? "bg-[#F5F3FF] text-[#7C3AED]" :
                            rec.color === "amber" ? "bg-[#FFFBEB] text-[#D97706]" :
                            rec.color === "red" ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0F9FF] text-[#0284C7]"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-bold text-[#111827] text-sm tracking-tight">{rec.title}</h3>
                        </div>
                        <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{rec.desc}</p>
                      </div>
                      <div className="border-t border-[#E5E7EB] pt-3 mt-auto">
                        <span className="text-xs font-semibold text-[#475569]">{rec.impact}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB CONTENT: UTILIZATION & DEPARTMENTS ───────────────────────── */}
        {activeTab === "utilization" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECTION 3: UTILIZATION BY DEPARTMENT */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                    <Building className="h-5 w-5 text-[#10B981]" />
                    <span>Section 3: Departmental Asset Utilization</span>
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">Cross-referencing active workloads and equipment counts across organizational segments.</p>
                </div>
                <button 
                  onClick={exportDepartmentCSV}
                  className="shrink-0 flex items-center gap-2 border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Download Dept CSV</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#475569] font-semibold">
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5 text-center">Total Assets</th>
                      <th className="px-6 py-3.5 text-center">Assets in Use</th>
                      <th className="px-6 py-3.5">Utilization Rate</th>
                      <th className="px-6 py-3.5 text-center">Trend (vs Last Month)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEPT_UTILIZATION.map((dept, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]/70 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-[#111827]">{dept.name}</td>
                        <td className="px-6 py-4 text-center font-medium text-[#475569]">{dept.total}</td>
                        <td className="px-6 py-4 text-center font-medium text-[#475569]">{dept.active}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#111827] w-12">{dept.pct.toFixed(1)}%</span>
                            <div className="w-24 bg-[#E5E7EB] h-2 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  dept.pct >= 80 ? "bg-[#10B981]" :
                                  dept.pct >= 60 ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                                )} 
                                style={{ width: `${dept.pct}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
                            dept.trend === "up" 
                              ? "bg-[#E8FBF2] text-[#059669] border-[#D1FAE5]" 
                              : "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]"
                          )}>
                            {dept.trend === "up" ? (
                              <>
                                <ArrowUpRight className="h-3 w-3" />
                                <span>Increasing</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3" />
                                <span>Decreasing</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart Ready Copy Area */}
              <div className="bg-[#F8FAFC] border-t border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#9CA3AF]" />
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Chart-Ready Integration Array:</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <code className="text-xs bg-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] block overflow-x-auto whitespace-nowrap max-w-full sm:max-w-md font-mono">
                    CHART_DATA_UTILIZATION: {JSON.stringify(DEPT_UTILIZATION.map(d => `${d.name}: ${d.pct.toFixed(1)}%`))}
                  </code>
                  <button 
                    onClick={() => handleCopy(`CHART_DATA_UTILIZATION: ${JSON.stringify(DEPT_UTILIZATION.map(d => `${d.name}: ${d.pct.toFixed(1)}%`))}`, "chart")}
                    className="shrink-0 text-xs text-[#059669] hover:text-[#047857] flex items-center gap-1 font-semibold border border-[#D1FAE5] bg-white rounded-lg px-2.5 py-1 hover:bg-[#ECFDF5] cursor-pointer"
                  >
                    {copiedSection === "chart" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === "chart" ? "Copied!" : "Copy Array"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 8: BOOKING HEATMAP DATA */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5E7EB] pb-4 mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#10B981]" />
                    <span>Section 8: Booking Heatmap Analysis</span>
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">Weekly load density map (bookings count) indicating peak pressure points.</p>
                </div>
                
                {/* Heatmap Legend */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-[#9CA3AF]">Density Index:</span>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-6 rounded bg-[#ECFDF5]" title="Low Usage (0-15)" />
                    <span className="h-3 w-6 rounded bg-[#A7F3D0]" title="Medium (15-40)" />
                    <span className="h-3 w-6 rounded bg-[#34D399]" title="High (40-60)" />
                    <span className="h-3 w-6 rounded bg-[#059669]" title="Critical (60+)" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase text-left w-16">Day</th>
                      {HEATMAP_HOURS.map((hr) => (
                        <th key={hr} className="px-3 py-2 text-xs font-bold text-[#475569]">{hr}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HEATMAP_DAYS.map((day) => {
                      const counts = HEATMAP_GRID[day];
                      return (
                        <tr key={day} className="border-b border-[#E5E7EB]/50 hover:bg-[#FAFAFA]">
                          <td className="px-4 py-3 font-bold text-[#111827] text-left text-xs uppercase">{day}</td>
                          {counts.map((val, idx) => (
                            <td key={idx} className="p-1">
                              <div 
                                className={cn(
                                  "h-9 rounded-lg flex items-center justify-center font-semibold text-xs transition-transform hover:scale-105",
                                  val >= 60 ? "bg-[#059669] text-white" :
                                  val >= 40 ? "bg-[#34D399] text-[#064e3b]" :
                                  val >= 15 ? "bg-[#A7F3D0] text-[#064e3b]" : "bg-[#ECFDF5] text-[#065f46]"
                                )}
                                title={`${day} ${HEATMAP_HOURS[idx]}: ${val} bookings`}
                              >
                                {val}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Heatmap Highlights Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-[#E5E7EB] bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 bg-[#FEF2F2] rounded-lg text-[#DC2626] flex items-center justify-center font-bold text-sm">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Peak Congestion Point</h4>
                    <p className="text-sm font-semibold text-[#111827]">Thursday 14:00 - 16:00 (88 bookings)</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Heavy concurrent reservation requests across IT workstations.</p>
                  </div>
                </div>
                
                <div className="border border-[#E5E7EB] bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 bg-[#E8FBF2] rounded-lg text-[#059669] flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Underutilized Capacity Slot</h4>
                    <p className="text-sm font-semibold text-[#111827]">Sunday 20:00 - 22:00 (3 bookings)</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Optimal timeframe for automated backend server batch updates.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB CONTENT: MAINTENANCE & LIFESPANS ─────────────────────────── */}
        {activeTab === "maintenance" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECTION 4: MAINTENANCE FREQUENCY ANALYSIS */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[#10B981]" />
                    <span>Section 4: Top 5 Maintenance Frequency Assets</span>
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">High-frequency wear analysis highlighting historical service count and financial outlays.</p>
                </div>
                <button 
                  onClick={exportMaintenanceCSV}
                  className="shrink-0 flex items-center gap-2 border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Download Maint CSV</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#475569] font-semibold">
                      <th className="px-6 py-3.5">Asset ID</th>
                      <th className="px-6 py-3.5">Asset Name</th>
                      <th className="px-6 py-3.5 text-center">Maintenance Count (6 mo)</th>
                      <th className="px-6 py-3.5 text-center">Avg Interval (Days)</th>
                      <th className="px-6 py-3.5 text-right">Total Maintenance Cost</th>
                      <th className="px-6 py-3.5">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAINTENANCE_ANALYSIS.map((item) => (
                      <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[#10B981]">{item.id}</td>
                        <td className="px-6 py-4 font-semibold text-[#111827]">{item.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-[#374151]">{item.count}</td>
                        <td className="px-6 py-4 text-center text-[#475569]">{item.avgDays} days</td>
                        <td className="px-6 py-4 text-right font-bold text-[#111827]">${item.cost.toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium text-[#6B7280]">{item.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SECTION 4 SUBSECTION: PREDICTIVE ALERTS */}
              <div className="bg-[#FAFAFA] border-t border-[#E5E7EB] p-6">
                <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-[#D97706]" />
                  <span>Sub-Analysis: Maintenance Predictive Service Alerts</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PREDICTIVE_ALERTS.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "bg-white border rounded-xl p-4 shadow-sm",
                        alert.priority === "High" ? "border-l-4 border-l-[#EF4444]" :
                        alert.priority === "Medium" ? "border-l-4 border-l-[#F59E0B]" : "border-l-4 border-l-[#3B82F6]"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-bold text-[#9CA3AF]">{alert.id}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          alert.priority === "High" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]" :
                          alert.priority === "Medium" ? "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" : "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]"
                        )}>
                          {alert.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#111827] mb-1">{alert.name}</h4>
                      <div className="flex items-center justify-between text-xs text-[#6B7280] mt-3">
                        <span>Dep: <strong>{alert.dept}</strong></span>
                        <span className="font-semibold text-[#111827]">Due in {alert.daysDue} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 7: ASSETS DUE FOR MAINTENANCE / NEARING RETIREMENT */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#10B981]" />
                  <span>Section 7: Assets Due For Service / Nearing Retirement</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Status index tracking structural condition score, timeline proximity, and recommended action steps.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#475569] font-semibold">
                      <th className="px-6 py-3.5">Asset ID</th>
                      <th className="px-6 py-3.5">Asset Name</th>
                      <th className="px-6 py-3.5 text-center">Age (Years)</th>
                      <th className="px-6 py-3.5 text-center">Timeline Horizon (Days)</th>
                      <th className="px-6 py-3.5 text-center">Condition Grade</th>
                      <th className="px-6 py-3.5 text-center">Priority</th>
                      <th className="px-6 py-3.5">Recommended Action Directive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUE_AND_RETIREMENT.map((asset) => (
                      <tr key={asset.id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[#10B981]">{asset.id}</td>
                        <td className="px-6 py-4 font-semibold text-[#111827]">{asset.name}</td>
                        <td className="px-6 py-4 text-center font-medium text-[#475569]">{asset.age}</td>
                        <td className="px-6 py-4 text-center font-bold text-[#111827]">
                          {asset.dueIn === 0 ? (
                            <span className="text-[#DC2626] font-bold">Past Due</span>
                          ) : (
                            <span>{asset.dueIn} days</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border",
                            asset.cond === "Good" ? "bg-[#E8FBF2] text-[#059669] border-[#D1FAE5]" :
                            asset.cond === "Fair" ? "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" : "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]"
                          )}>
                            {asset.cond}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                            asset.priority === "High" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]" :
                            asset.priority === "Medium" ? "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" : "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]"
                          )}>
                            {asset.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#475569]">{asset.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB CONTENT: IDLE & BOTTOM PERFORMERS ────────────────────────── */}
        {activeTab === "idle" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECTION 5: MOST USED ASSETS */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-[#10B981]" />
                  <span>Section 5: Most Used Assets (Top 5 Usage Rank)</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">High-utilization assets tracking booking volume frequency and average session durations.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#475569] font-semibold">
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Asset ID</th>
                      <th className="px-6 py-3.5">Asset Name</th>
                      <th className="px-6 py-3.5 text-center">Bookings / Usage (Month)</th>
                      <th className="px-6 py-3.5">Primary Department Owner</th>
                      <th className="px-6 py-3.5">Average Duration Per Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOST_USED_ASSETS.map((asset, index) => (
                      <tr key={asset.id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669] font-bold text-xs">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[#10B981]">{asset.id}</td>
                        <td className="px-6 py-4 font-semibold text-[#111827]">{asset.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-[#111827]">{asset.usage} times</td>
                        <td className="px-6 py-4 font-medium text-[#6B7280]">{asset.dept}</td>
                        <td className="px-6 py-4 font-semibold text-[#374151]">{asset.avgDuration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 6: IDLE ASSETS */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                    <ArrowDownRight className="h-5 w-5 text-[#DC2626]" />
                    <span>Section 6: Idle Assets Portfolio (Bottom 5 Usage Rank)</span>
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">Asset registry items representing zero bookings or field activity in the preceding 30 days.</p>
                </div>
                <button 
                  onClick={exportIdleAssetsCSV}
                  className="shrink-0 flex items-center gap-2 border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#DC2626]" />
                  <span>Download Idle CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#475569] font-semibold">
                      <th className="px-6 py-3.5">Asset ID</th>
                      <th className="px-6 py-3.5">Asset Name</th>
                      <th className="px-6 py-3.5 text-center">Days Inactive</th>
                      <th className="px-6 py-3.5">Last Known Location / Location</th>
                      <th className="px-6 py-3.5 text-center">Condition Status</th>
                      <th className="px-6 py-3.5">Recommended Optimization Directive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IDLE_ASSETS.map((asset) => (
                      <tr key={asset.id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[#DC2626]">{asset.id}</td>
                        <td className="px-6 py-4 font-semibold text-[#111827]">{asset.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-[#111827]">{asset.days} days</td>
                        <td className="px-6 py-4 font-medium text-[#6B7280]">{asset.loc}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border",
                            asset.cond === "Good" ? "bg-[#E8FBF2] text-[#059669] border-[#D1FAE5]" :
                            asset.cond === "Fair" ? "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" : "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]"
                          )}>
                            {asset.cond}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-lg">
                            {asset.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB CONTENT: EXPORT RAW DATA ─────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECTION 10: EXPORT DATA WIDGETS */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-2">
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-[#10B981]" />
                  <span>Section 10: Export Raw Data Structured Blocks</span>
                </h2>
                <button 
                  onClick={exportAllToCSV}
                  className="flex items-center gap-2 border-none bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Combined CSV</span>
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-6">Select a code segment below and click the button to copy or download individual CSV segments processed via PapaParse.</p>
              
              <div className="space-y-6">
                
                {/* Export Block 1: CSV_EXPORT_UTILIZATION */}
                <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-[#F8FAFC]">
                  <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] font-mono">CSV_EXPORT_UTILIZATION</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={exportDepartmentCSV}
                        className="text-xs text-[#059669] hover:text-[#047857] flex items-center gap-1 font-semibold cursor-pointer border border-[#D1FAE5] bg-[#ECFDF5]/30 rounded-lg px-3 py-1 hover:bg-[#ECFDF5]"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download CSV</span>
                      </button>
                      <button 
                        onClick={() => handleCopy(
`department,utilized_assets,total_assets,percentage
HR,68,110,61.8
IT,374,420,89.0
Operations,312,380,82.1
Facilities,48,85,56.4
Logistics,128,145,88.2
Sales,40,68,58.8
Marketing,8,40,20.0`, "csv_util")}
                        className="text-xs text-[#374151] hover:text-black flex items-center gap-1 font-semibold cursor-pointer border border-[#E5E7EB] bg-white rounded-lg px-3 py-1 hover:bg-[#F3F4F6]"
                      >
                        {copiedSection === "csv_util" ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSection === "csv_util" ? "Copied!" : "Copy to Clipboard"}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#374151] overflow-x-auto whitespace-pre leading-relaxed select-all">
{`department,utilized_assets,total_assets,percentage
HR,68,110,61.8
IT,374,420,89.0
Operations,312,380,82.1
Facilities,48,85,56.4
Logistics,128,145,88.2
Sales,40,68,58.8
Marketing,8,40,20.0`}
                  </pre>
                </div>

                {/* Export Block 2: CSV_EXPORT_MAINTENANCE */}
                <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-[#F8FAFC]">
                  <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] font-mono">CSV_EXPORT_MAINTENANCE</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={exportMaintenanceCSV}
                        className="text-xs text-[#059669] hover:text-[#047857] flex items-center gap-1 font-semibold cursor-pointer border border-[#D1FAE5] bg-[#ECFDF5]/30 rounded-lg px-3 py-1 hover:bg-[#ECFDF5]"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download CSV</span>
                      </button>
                      <button 
                        onClick={() => handleCopy(
`asset_id,asset_name,maintenance_count_6m,total_cost_usd,department
AF-TRK-09,Heavy Duty Forklift,8,4200,Logistics
AF-VAN-03,Delivery Van Transit,6,3500,Logistics
AF-PRN-12,Enterprise Plotter Printer,5,1850,Facilities
AF-SRV-22,Rack Server Pro Node-B,4,2400,IT
AF-AC-041,Server Room Cooling HVAC 1,4,3100,Facilities`, "csv_maint")}
                        className="text-xs text-[#374151] hover:text-black flex items-center gap-1 font-semibold cursor-pointer border border-[#E5E7EB] bg-white rounded-lg px-3 py-1 hover:bg-[#F3F4F6]"
                      >
                        {copiedSection === "csv_maint" ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSection === "csv_maint" ? "Copied!" : "Copy to Clipboard"}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#374151] overflow-x-auto whitespace-pre leading-relaxed select-all">
{`asset_id,asset_name,maintenance_count_6m,total_cost_usd,department
AF-TRK-09,Heavy Duty Forklift,8,4200,Logistics
AF-VAN-03,Delivery Van Transit,6,3500,Logistics
AF-PRN-12,Enterprise Plotter Printer,5,1850,Facilities
AF-SRV-22,Rack Server Pro Node-B,4,2400,IT
AF-AC-041,Server Room Cooling HVAC 1,4,3100,Facilities`}
                  </pre>
                </div>

                {/* Export Block 3: CSV_EXPORT_IDLE_ASSETS */}
                <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-[#F8FAFC]">
                  <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] font-mono">CSV_EXPORT_IDLE_ASSETS</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={exportIdleAssetsCSV}
                        className="text-xs text-[#059669] hover:text-[#047857] flex items-center gap-1 font-semibold cursor-pointer border border-[#D1FAE5] bg-[#ECFDF5]/30 rounded-lg px-3 py-1 hover:bg-[#ECFDF5]"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download CSV</span>
                      </button>
                      <button 
                        onClick={() => handleCopy(
`asset_id,asset_name,days_idle,last_known_location,condition,recommended_action
AF-TAB-88,Tablet Pro 12.9 (Batch H),92,Marketing Depository,Good,Reassign to Sales
AF-PRJ-08,Portable LED Projector Slim,78,Sales Storage Bin C,Fair,Sell Surplus
AF-LAP-334,Legacy Core i5 Laptop 334,65,IT IT-Recycle Stack,Poor,Retire / Recycle
AF-BIK-05,Cargo Logistics Electric Bike 05,48,Logistics Loading Dock 2,Fair,Inspect / Maintenance
AF-WS-19,Standing Desk Frame Prototype 19,35,HR Flex Space,Good,Reassign to IT`, "csv_idle")}
                        className="text-xs text-[#374151] hover:text-black flex items-center gap-1 font-semibold cursor-pointer border border-[#E5E7EB] bg-white rounded-lg px-3 py-1 hover:bg-[#F3F4F6]"
                      >
                        {copiedSection === "csv_idle" ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSection === "csv_idle" ? "Copied!" : "Copy to Clipboard"}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#374151] overflow-x-auto whitespace-pre leading-relaxed select-all">
{`asset_id,asset_name,days_idle,last_known_location,condition,recommended_action
AF-TAB-88,Tablet Pro 12.9 (Batch H),92,Marketing Depository,Good,Reassign to Sales
AF-PRJ-08,Portable LED Projector Slim,78,Sales Storage Bin C,Fair,Sell Surplus
AF-LAP-334,Legacy Core i5 Laptop 334,65,IT IT-Recycle Stack,Poor,Retire / Recycle
AF-BIK-05,Cargo Logistics Electric Bike 05,48,Logistics Loading Dock 2,Fair,Inspect / Maintenance
AF-WS-19,Standing Desk Frame Prototype 19,35,HR Flex Space,Good,Reassign to IT`}
                  </pre>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ─── Footer ────────────────────────────────────────────────────────── */}
        <footer className="mt-16 border-t border-[#E5E7EB] pt-8 text-center text-xs text-[#9CA3AF] pb-8">
          <p className="font-medium text-[#6B7280]">
            Report Generated by AssetFlow AI · {mounted ? genTime : ""}
          </p>
          <p className="mt-1.5">
            AssetFlow Inc. Confidential · Audit Compliance Grade A2-3
          </p>
        </footer>

      </main>
      
    </div>
  );
}
