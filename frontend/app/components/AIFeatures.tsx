import { Icon, ImageBox, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const blocks: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "tag",
    title: "Asset Registration",
    desc: "Onboard assets with category, owner, and location captured from day one.",
  },
  {
    icon: "flow",
    title: "Allocation & Transfer Approval",
    desc: "Every assignment and hand-off follows a structured approval chain.",
  },
  {
    icon: "bolt",
    title: "Maintenance Workflow",
    desc: "Requests are approved, assigned, and resolved with full history.",
  },
  {
    icon: "check",
    title: "Scheduled Audits",
    desc: "Run audit cycles that surface discrepancies and keep records clean.",
  },
];

export default function AIFeatures() {
  return (
    <section id="workflow" className="bg-card px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Workflows"
            title="Built Around Real Enterprise Workflows"
            desc="From asset registration to audits, every process follows structured approval workflows that ensure accountability, transparency, and operational efficiency."
          />
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          {/* Visual */}
          <Reveal>
            <ImageBox className="aspect-[5/4] w-full" />
          </Reveal>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {blocks.map((b, i) => (
              <Reveal
                key={b.title}
                delay={i * 0.1}
                className="flex gap-4 rounded-2xl border border-border bg-bg p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={b.icon} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{b.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
