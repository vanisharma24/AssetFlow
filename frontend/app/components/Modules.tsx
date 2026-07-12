import { Icon, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const modules: { icon: IconName; label: string }[] = [
  { icon: "tag", label: "Asset Management" },
  { icon: "user", label: "Employee Directory" },
  { icon: "flow", label: "Department Management" },
  { icon: "calendar", label: "Resource Booking" },
  { icon: "bolt", label: "Maintenance" },
  { icon: "check", label: "Audits" },
  { icon: "chart", label: "Reports" },
  { icon: "flag", label: "Notifications" },
];

export default function Modules() {
  return (
    <section id="modules" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Modules"
            title="Complete ERP Modules"
            desc="Every operational area your organization needs, integrated into one platform."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
            <Reveal
              key={m.label}
              delay={(i % 4) * 0.06}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-5 card-hover"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon name={m.icon} />
              </span>
              <span className="text-sm font-semibold text-ink">{m.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
