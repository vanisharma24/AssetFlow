import { Icon, ImageBox, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const items: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "chart",
    title: "Live KPIs",
    desc: "Total assets, utilization, and outstanding requests at a glance.",
  },
  {
    icon: "check",
    title: "Pending Approvals",
    desc: "Allocation, transfer, and maintenance requests awaiting your action.",
  },
  {
    icon: "calendar",
    title: "Upcoming Bookings",
    desc: "Rooms, vehicles, and equipment reserved across your teams.",
  },
  {
    icon: "trend",
    title: "Operational Insights",
    desc: "Maintenance frequency and department performance trends.",
  },
];

export default function Analytics() {
  return (
    <section className="border-y border-border bg-surface px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Dashboard"
              title="A Centralized Dashboard for Every Role"
              desc="Role-specific dashboards provide real-time KPIs, pending approvals, upcoming bookings, and operational insights so every user sees only what matters."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ImageBox className="aspect-[5/4] w-full" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal
              key={it.title}
              delay={i * 0.08}
              className="rounded-2xl border border-border bg-bg p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon name={it.icon} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{it.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{it.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
