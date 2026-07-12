import type { ReactNode } from "react"

import { SessionNavBar } from "@/components/ui/sidebar"

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_38%,#f8fafc_100%)] text-slate-950">
      <SessionNavBar />
      <main className="min-h-screen pl-20">{children}</main>
    </div>
  )
}