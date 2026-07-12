import { Icon, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const roles: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "lock",
    title: "Admin",
    desc: "Configure departments, categories, employees, and organization-wide settings.",
  },
  {
    icon: "tag",
    title: "Asset Manager",
    desc: "Manage registrations, allocations, maintenance approvals, and transfers.",
  },
  {
    icon: "flag",
    title: "Department Head",
    desc: "Approve requests, oversee departmental assets, and coordinate resources.",
  },
  {
    icon: "user",
    title: "Employee",
    desc: "Book resources, request maintenance, and manage assigned assets.",
  },
];

export default function Testimonials() {
  return (
    <section id="roles" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Access Control"
            title="Designed for Every Role"
            desc="Role-based permissions give each person exactly the access they need — nothing more."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r, i) => (
            <Reveal
              key={r.title}
              delay={i * 0.08}
              as="article"
              className="flex flex-col rounded-3xl border border-border bg-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={r.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{r.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
