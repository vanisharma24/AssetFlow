import { T } from "./ui";

export default function Logos() {
  const items = Array.from({ length: 7 });
  const row = [...items, ...items];
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted">
          {T}
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-14 pr-14">
            {row.map((_, i) => (
              <div key={i} className="flex items-center gap-2 text-muted/60">
                <span className="h-5 w-5 rounded bg-[var(--swatch)]" />
                <span className="whitespace-nowrap text-lg font-semibold tracking-tight">
                  {T}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
