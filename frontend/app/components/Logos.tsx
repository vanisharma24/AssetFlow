const stats = [
  { value: "7", label: "Asset Lifecycle States" },
  { value: "100%", label: "Allocation Conflict Prevention" },
  { value: "4", label: "Role-Based Access Levels" },
  { value: "Real-Time", label: "Operational Dashboard" },
];

export default function Logos() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted">
          Built for organizations that manage physical assets at scale
        </p>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 bg-card px-6 py-8 text-center"
            >
              <span className="text-3xl font-semibold tracking-tight text-ink">
                {s.value}
              </span>
              <span className="text-sm leading-6 text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
