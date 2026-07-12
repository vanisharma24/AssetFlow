"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon, T } from "./ui";

const plans = [
  { monthly: 39, popular: false, features: [T, T, T, T] },
  { monthly: 79, popular: true, features: [T, T, T, T, T] },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-card px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {T}
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
            {T}
          </h2>
          <p className="text-base leading-7 text-muted">{T}</p>
        </motion.div>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={yearly ? "text-muted" : "text-ink"}>{T}</span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-12 rounded-full border border-border bg-bg"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-accent ${
                yearly ? "left-6" : "left-0.5"
              }`}
            />
          </button>
          <span className={yearly ? "text-ink" : "text-muted"}>
            {T} <span className="text-accent">{T}</span>
          </span>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {plans.map((p, i) => {
            const price = yearly ? Math.round(p.monthly * 0.8) : p.monthly;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className={`relative rounded-3xl border p-8 ${
                  p.popular
                    ? "border-accent bg-bg"
                    : "border-border bg-bg"
                }`}
              >
                {p.popular ? (
                  <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-bg">
                    {T}
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold text-ink">{T}</h3>
                <p className="mt-1 text-sm text-muted">{T}</p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-semibold text-ink">${price}</span>
                  <span className="pb-2 text-sm text-muted">/{T}</span>
                </div>

                <a
                  href="#"
                  className={`mt-6 flex h-12 items-center justify-center rounded-full text-sm font-medium transition-opacity hover:opacity-90 ${
                    p.popular
                      ? "bg-accent text-bg"
                      : "bg-ink text-bg"
                  }`}
                >
                  {T}
                </a>

                <ul className="mt-8 flex flex-col gap-3">
                  {p.features.map((f, k) => (
                    <li key={k} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                        <Icon name="check" className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
