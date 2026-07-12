import { Icon, SectionHeading, T, type IconName } from "./ui";
import Reveal from "./Reveal";

const feats: IconName[] = ["flag", "tag", "trophy", "trend", "flow", "lock"];

export default function CoreFeatures() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal
              key={i}
              delay={(i % 3) * 0.08}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={f} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{T}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{T}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
