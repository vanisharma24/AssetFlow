import { Icon, T } from "./ui";
import Reveal from "./Reveal";

export default function FooterCTA() {
  return (
    <section className="px-4 py-16">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-20 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-bg sm:text-5xl">
              {T}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-bg/70">{T}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-bg transition-opacity hover:opacity-90"
              >
                {T}
                <Icon name="arrow" className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-bg transition-colors hover:bg-white/10"
              >
                {T}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
