"use client";

import { motion } from "framer-motion";
import { Icon, ImageBox } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export default function Hero() {
  return (
    <section className="relative px-4 pt-36 pb-16 sm:pt-40">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          variants={item}
          className="flex items-center gap-3 rounded-full border border-border bg-card py-1 pl-1 pr-4"
        >
          <span className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-6 w-6 rounded-full border-2 border-card bg-[var(--swatch)]"
              />
            ))}
          </span>
          <span className="text-xs font-medium text-muted">
            Enterprise Asset Management Platform
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl text-balance"
        >
          Manage Every Asset. Track Every Resource. Automate Every Workflow.
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-8 text-muted">
          AssetFlow centralizes asset tracking, resource booking, maintenance
          workflows, and audit management into one intelligent ERP platform. Reduce
          manual work, eliminate allocation conflicts, and gain complete visibility
          across your organization.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Launch Dashboard
            <Icon name="arrow" className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-ink transition-colors hover:bg-[var(--hover)]"
          >
            View Features
          </a>
        </motion.div>
      </motion.div>

      {/* Hero visual */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease }}
        className="mx-auto mt-16 max-w-5xl"
      >
        <div className="rounded-3xl border border-border bg-card p-2 shadow-[0_30px_80px_-40px_rgba(20,18,14,0.4)]">
          <ImageBox className="aspect-[16/9] w-full" />
        </div>
      </motion.div>
    </section>
  );
}
