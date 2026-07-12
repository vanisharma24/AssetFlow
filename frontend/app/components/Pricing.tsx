import { Icon, SectionHeading, type IconName } from "./ui";
import Reveal from "./Reveal";

const highlights: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "bolt",
    title: "Enterprise Ready",
    desc: "Scalable architecture built using modern technologies.",
  },
  {
    icon: "lock",
    title: "Secure",
    desc: "JWT authentication with role-based access control.",
  },
  {
    icon: "activity",
    title: "Responsive",
    desc: "Optimized experience across desktop, tablet, and mobile devices.",
  },
];

export default function Pricing() {
  return (
    <section id="highlights" className="border-y border-border bg-surface px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            eyebrow="Project Highlights"
            title="Engineered Like a Production ERP"
            desc="Built for the Odoo Hiring Hackathon with the same rigor as a real enterprise product."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal
              key={h.title}
              delay={i * 0.1}
              className="rounded-3xl border border-border bg-bg p-8 text-center"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={h.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{h.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{h.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
