import type { ReactNode } from "react";

/* Placeholder token for all copy in this template */
export const T = "[REPLACE TEXTS]";

/* Small pill label above section headings */
export function Eyebrow({ children = T }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title = T,
  desc = T,
  align = "center",
}: {
  eyebrow?: string;
  title?: ReactNode;
  desc?: ReactNode;
  align?: "center" | "left";
}) {
  const alignCls =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignCls}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      <p className="text-base leading-7 text-muted">{desc}</p>
    </div>
  );
}

/* Branded visual placeholder — a soft dashboard-style panel */
export function ImageBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-[var(--hover)] ${className}`}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/70 via-transparent to-accent/10" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-bg">
          <Icon name="activity" className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-semibold tracking-tight text-ink">AssetFlow</span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex gap-3">
        <div className="h-16 flex-1 rounded-lg border border-border bg-card/80" />
        <div className="h-16 flex-1 rounded-lg border border-border bg-card/80" />
        <div className="hidden h-16 flex-1 rounded-lg border border-border bg-card/80 sm:block" />
      </div>
    </div>
  );
}

/* Buttons */
export function ButtonPrimary({
  children = T,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={`inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-bg transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </a>
  );
}

export function ButtonGhost({
  children = T,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={`inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-ink transition-colors hover:bg-[var(--hover)] ${className}`}
    >
      {children}
    </a>
  );
}

/* Minimal inline icon set */
export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

export type IconName =
  | "check"
  | "arrow"
  | "arrowUpRight"
  | "activity"
  | "eye"
  | "chart"
  | "bolt"
  | "target"
  | "flag"
  | "tag"
  | "trophy"
  | "trend"
  | "flow"
  | "lock"
  | "calendar"
  | "map"
  | "user"
  | "star"
  | "plus"
  | "minus"
  | "menu"
  | "close";

const paths: Record<IconName, ReactNode> = {
  check: <path d="M5 12l4 4 10-10" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  activity: <path d="M3 12h4l2 6 4-14 2 8h6" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h11l-2 3 2 3H5" />,
  tag: (
    <>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 15h4l1 5H9l1-5Z" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M21 7h-5M21 7v5" />
    </>
  ),
  flow: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" />
      <path d="M9 6h6a3 3 0 0 1 3 3v6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  star: <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};
