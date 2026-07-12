"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import {
  BellRing,
  Building2,
  CalendarCheck2,
  ChevronsUpDown,
  ClipboardList,
  FileClock,
  FolderSearch,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users2,
  Wrench,
} from "lucide-react"

import { workflowGroups, workflowStages } from "@/app/workflow/stages"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  landing: LayoutDashboard,
  authentication: ShieldCheck,
  roleDetection: FolderSearch,
  superAdmin: Building2,
  organizationAdmin: Users2,
  organizationSetup: Sparkles,
  employeeDirectory: ClipboardList,
  roleAssignment: ChevronsUpDown,
  assetRegistration: PackageSearch,
  assetAllocation: CalendarCheck2,
  sharedResources: Sparkles,
  maintenance: Wrench,
  returnsAudit: FileClock,
  reportsAnalytics: FileClock,
  notificationsLogs: BellRing,
}

export function SessionNavBar() {
  const [collapsed, setCollapsed] = useState(true)
  const pathname = usePathname()

  const groups = useMemo(
    () =>
      workflowGroups.map((group) => ({
        ...group,
        items: group.slugs
          .map((slug) => workflowStages.find((stage) => stage.slug === slug))
          .filter((stage): stage is (typeof workflowStages)[number] => Boolean(stage)),
      })),
    [],
  )

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl"
      initial={collapsed ? "closed" : "open"}
      animate={collapsed ? "closed" : "open"}
      variants={{ open: { width: "17rem" }, closed: { width: "5rem" } }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.22 }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-white/10 px-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-11 w-full rounded-2xl px-3 text-white hover:bg-white/5 hover:text-white">
              <span className="flex w-full items-center justify-start gap-3">
                <Avatar className="h-9 w-9 border border-white/10 bg-white/10">
                  <AvatarFallback className="bg-transparent text-white">AF</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-semibold">AssetFlow</span>
                      <span className="block truncate text-xs text-slate-400">Workflow console</span>
                    </span>
                    <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                  </span>
                )}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Link href="/workflow/landing">Workflow overview</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/workflow/reports-analytics">Reports & analytics</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                <LogOut className="mr-2 h-4 w-4" /> Reset demo session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-3">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
                  <Sparkles className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Frontend only</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">Navigation is wired to the asset lifecycle pages only.</p>
                  </div>
                )}
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>{group.title}</span>
                    <span>{group.items.length}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  {group.items.map((stage) => {
                    const Icon = iconMap[stage.slug] ?? LayoutDashboard
                    return (
                      <Link
                        key={stage.slug}
                        href={stage.path}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all",
                          pathname === stage.path
                            ? "bg-white/10 text-white ring-1 ring-white/15"
                            : "text-slate-300 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10", pathname === stage.path ? "bg-white/15 text-white" : "bg-white/5 text-slate-300")}> 
                          <Icon className="h-4 w-4" />
                        </span>
                        {!collapsed && (
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{stage.title}</span>
                            <span className="block truncate text-xs text-slate-400 group-hover:text-slate-300">{stage.eyebrow}</span>
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
                <Separator className="my-4 bg-white/10" />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 p-3">
          {!collapsed ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white/10 bg-emerald-500/20">
                  <AvatarFallback className="bg-transparent text-emerald-200">OA</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Organization Admin</p>
                  <p className="truncate text-xs text-slate-400">Demo workspace preview</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20">No backend</Badge>
                <Badge variant="outline" className="border-white/15 text-slate-300">UI flow</Badge>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-300 ring-1 ring-white/10">
                <Settings2 className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}