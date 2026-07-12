import { Icon, ImageBox, SectionHeading, T, type IconName } from "./ui";
import Reveal from "./Reveal";

const items: IconName[] = ["calendar", "map", "user", "star"];

export default function Analytics() {
  return (
    <section className="bg-card px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading align="left" />
          </Reveal>
          <Reveal delay={0.1}>
            <ImageBox className="aspect-[5/4] w-full" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal
              key={i}
              delay={i * 0.08}
              className="rounded-2xl border border-border bg-bg p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon name={it} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{T}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{T}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
