import { Icon, ImageBox, SectionHeading, T, type IconName } from "./ui";
import Reveal from "./Reveal";

const cards: { icon: IconName }[] = [
  { icon: "activity" },
  { icon: "eye" },
  { icon: "chart" },
];

export default function WhyChoose() {
  return (
    <section id="why" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal
              key={i}
              delay={i * 0.1}
              as="article"
              className="flex flex-col rounded-3xl border border-border bg-card p-6"
            >
              <ImageBox className="aspect-[4/3] w-full" />
              <span className="mt-6 grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={c.icon} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{T}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{T}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
