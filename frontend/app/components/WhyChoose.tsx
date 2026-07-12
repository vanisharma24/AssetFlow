import { Icon, ImageBox, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const cards: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "activity",
    title: "Asset Lifecycle",
    desc: "Track every asset from registration to retirement with complete ownership history.",
  },
  {
    icon: "flow",
    title: "Smart Allocation",
    desc: "Assign assets to employees or departments while automatically preventing duplicate allocations.",
  },
  {
    icon: "calendar",
    title: "Resource Booking",
    desc: "Reserve meeting rooms, vehicles, and shared equipment with conflict-free scheduling.",
  },
];

export default function WhyChoose() {
  return (
    <section id="features" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Core Features"
            title="Everything Your Organization Needs to Manage Assets Efficiently"
            desc="Purpose-built modules that replace spreadsheets and manual approvals with structured, conflict-free workflows."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.1}
              as="article"
              className="flex flex-col rounded-3xl border border-border bg-card p-6"
            >
              <ImageBox className="aspect-[4/3] w-full" />
              <span className="mt-6 grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={c.icon} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{c.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
