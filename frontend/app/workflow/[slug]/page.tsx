import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { WorkflowStageView } from "../WorkflowStageView"
import { getWorkflowStage, workflowStages } from "../stages"

export function generateStaticParams() {
  return workflowStages.map((stage) => ({ slug: stage.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const stage = getWorkflowStage(slug)
  if (!stage) return { title: "Workflow" }
  return { title: stage.title, description: stage.summary }
}

export default async function WorkflowStagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const stage = getWorkflowStage(slug)
  if (!stage) notFound()
  return <WorkflowStageView slug={slug} />
}