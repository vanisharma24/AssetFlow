import Link from "next/link"
import { ArrowRight, BadgeCheck, CircleDashed, Sparkles } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getWorkflowStage, workflowStages } from "./stages"

export function WorkflowStageView({ slug }: { slug: string }) {
  const stage = getWorkflowStage(slug)

  if (!stage) {
    return null
  }

  const StageIcon = stage.icon
  const isLanding = stage.slug === "landing"

  return (
    <section className="relative overflow-hidden px-6 py-8 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),transparent_55%)]" />
      <div className="relative max-w-7xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              <CircleDashed className="h-3.5 w-3.5" />
              {stage.section}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{stage.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{stage.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {stage.actors.map((actor) => (
                <Badge key={actor} variant="outline" className="border-slate-200 bg-white text-slate-600">
                  {actor}
                </Badge>
              ))}
            </div>
          </div>

          <div className={`w-full max-w-md rounded-[2rem] bg-gradient-to-br ${stage.accent} p-[1px] shadow-[0_24px_80px_rgba(15,23,42,0.15)]`}>
            <div className="rounded-[calc(2rem-1px)] bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                  <StageIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Current page</p>
                  <p className="text-lg font-semibold">{stage.title}</p>
                </div>
              </div>
              <Separator className="my-4 bg-white/10" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-400">Actors</p>
                  <p className="mt-1 font-semibold">{stage.actors.length}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-400">Next hops</p>
                  <p className="mt-1 font-semibold">{stage.next.length || "End"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {isLanding ? (
              <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/40 backdrop-blur">
                <CardHeader>
                  <CardTitle>Workflow map</CardTitle>
                  <CardDescription>The required pages are exposed below as routeable screens so you can review the journey end to end.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {workflowStages.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.slug}
                          href={item.path}
                          className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-100/40"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-950">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{item.summary}</p>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/40 backdrop-blur">
              <CardHeader>
                <CardTitle>Inputs and outputs</CardTitle>
                <CardDescription>Each stage is modeled as a state transition, not a static mock.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Inputs</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {stage.inputs.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Outputs</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {stage.outputs.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-slate-950 text-white shadow-lg shadow-slate-200/40">
              <CardHeader>
                <CardTitle className="text-white">Decision checks</CardTitle>
                <CardDescription className="text-slate-400">The page focuses on the branching rules that make the workflow deterministic.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-300">
                  {stage.checks.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                      <Sparkles className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/40 backdrop-blur">
              <CardHeader>
                <CardTitle>Next pages</CardTitle>
                <CardDescription>The sidebar links follow the actual route order in the flow.</CardDescription>
              </CardHeader>
              <CardContent>
                {stage.next.length ? (
                  <div className="flex flex-wrap gap-2">
                    {stage.next.map((slug) => {
                      const nextStage = getWorkflowStage(slug)
                      return (
                        <Link
                          key={slug}
                          href={nextStage?.path ?? "/workflow/landing"}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {nextStage?.title ?? slug}
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">This is the terminal step for the flow and feeds into notifications and activity logs.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}