import { Icon, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const feats: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "eye",
    title: "Real-Time Visibility",
    desc: "Know exactly where every asset is and who is responsible for it.",
  },
  {
    icon: "lock",
    title: "Role-Based Security",
    desc: "Separate permissions for administrators, managers, department heads, and employees.",
  },
  {
    icon: "bolt",
    title: "Maintenance Tracking",
    desc: "Approve, assign, and resolve maintenance requests with complete history.",
  },
  {
    icon: "check",
    title: "Audit Ready",
    desc: "Run audit cycles with discrepancy reports and historical records.",
  },
  {
    icon: "flag",
    title: "Smart Notifications",
    desc: "Receive reminders for overdue returns, bookings, and maintenance events.",
  },
  {
    icon: "trend",
    title: "Actionable Insights",
    desc: "Monitor utilization, maintenance frequency, and department performance.",
  },
];

export default function CoreFeatures() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Benefits"
            title="Why Teams Choose AssetFlow"
            desc="Everything accountable, everything traceable — from the first allocation to the final audit."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 0.08}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
