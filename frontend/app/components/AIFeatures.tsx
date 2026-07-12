import { Icon, ImageBox, SectionHeading, T, type IconName } from "./ui";
import Reveal from "./Reveal";

const blocks: { icon: IconName }[] = [
  { icon: "bolt" },
  { icon: "target" },
  { icon: "flow" },
];

export default function AIFeatures() {
  return (
    <section id="features" className="bg-card px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading />
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
                key={i}
                delay={i * 0.1}
                className="flex gap-4 rounded-2xl border border-border bg-bg p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={b.icon} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{T}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{T}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
