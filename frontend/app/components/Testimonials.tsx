import { Icon, SectionHeading, T } from "./ui";
import Reveal from "./Reveal";

export default function Testimonials() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Reveal
              key={i}
              delay={i * 0.1}
              as="article"
              className="flex flex-col rounded-3xl border border-border bg-card p-8"
            >
              <div className="flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Icon key={s} name="star" className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-xl font-medium leading-8 text-ink">
                “{T}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="h-11 w-11 rounded-full bg-[var(--swatch)]" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{T}</span>
                  <span className="block text-xs text-muted">{T}</span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
