import { Icon } from "./ui";

const columns: { heading: string; links: string[] }[] = [
  {
    heading: "Product",
    links: ["Asset Management", "Resource Booking", "Maintenance", "Audits"],
  },
  {
    heading: "Company",
    links: ["About", "Documentation", "GitHub", "Contact"],
  },
  {
    heading: "Resources",
    links: ["API", "Support", "Privacy Policy", "Terms"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="#" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-bg">
              <Icon name="activity" className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">AssetFlow</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            An enterprise asset management platform for tracking, booking,
            maintenance, and audits — all in one place.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-sm font-semibold text-ink">{col.heading}</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row">
        <p>Built for the Odoo Hiring Hackathon • 2026</p>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <a
              key={i}
              href="#"
              className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-[var(--hover)] hover:text-ink"
            >
              <span className="h-3 w-3 rounded-full bg-[var(--swatch)]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
