"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { GraduationCap, Briefcase, Users, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/content/types";

type Kind = TimelineEntry["kind"];

const GROUPS: {
  kind: Kind;
  label: string;
  Icon: typeof GraduationCap;
  dotClass: string;
  iconClass: string;
  spineClass: string;
}[] = [
  {
    kind: "education",
    label: "Education",
    Icon: GraduationCap,
    dotClass: "bg-cornflower-300",
    iconClass: "text-cornflower-300",
    spineClass: "bg-gradient-to-b from-cornflower-400/60 to-cornflower-400/20",
  },
  {
    kind: "experience",
    label: "Work Experience",
    Icon: Briefcase,
    dotClass: "bg-pink-300",
    iconClass: "text-pink-300",
    spineClass: "bg-gradient-to-b from-pink-300/70 to-pink-300/20",
  },
  {
    kind: "organization",
    label: "Organization & Volunteering",
    Icon: Users,
    dotClass: "bg-sage-400",
    iconClass: "text-sage-400",
    spineClass: "bg-gradient-to-b from-sage-400/70 to-sage-400/20",
  },
  {
    kind: "other",
    label: "Other",
    Icon: Sparkles,
    dotClass: "bg-rosewood-400",
    iconClass: "text-rosewood-400",
    spineClass: "bg-gradient-to-b from-rosewood-400/70 to-rosewood-400/20",
  },
];

export function Journey({ timeline }: { timeline: TimelineEntry[] }) {
  const groups = GROUPS.map((g) => ({
    ...g,
    items: timeline.filter((t) => t.kind === g.kind),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="journey" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="02 — Journey"
        title="One thing led to the next"
        lede="Split into what I studied, where I worked, and the teams I helped run alongside."
      />

      <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
        {groups.map((g) => (
          <TimelineGroup key={g.kind} group={g} />
        ))}
      </div>
    </section>
  );
}

function TimelineGroup({
  group,
}: {
  group: (typeof GROUPS)[number] & { items: TimelineEntry[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.6"],
  });

  const { Icon, label, items, dotClass, iconClass, spineClass } = group;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 md:mb-10">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full",
            "bg-lagoon-50/[0.06]"
          )}
        >
          <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
        </span>
        <h3 className="font-display text-xl font-semibold text-lavender-50 md:text-2xl">
          {label}
        </h3>
      </div>

      <div ref={ref} className="relative">
        {/* Static rail */}
        <div
          aria-hidden="true"
          className="absolute left-[11px] top-2 h-full w-px bg-lagoon-50/25 md:left-1/2 md:-translate-x-1/2"
        />
        {/* Drawn rail (per-group color) */}
        <motion.div
          aria-hidden="true"
          style={{ scaleY: scrollYProgress }}
          className={cn(
            "absolute left-[11px] top-2 h-full w-px origin-top md:left-1/2 md:-translate-x-1/2",
            spineClass
          )}
        />

        <ol className="space-y-10 md:space-y-2">
          {items.map((item, i) => {
            const left = i % 2 === 0;
            return (
              <li
                key={`${item.period}-${item.title}`}
                className={cn(
                  "relative pl-10 md:grid md:grid-cols-2 md:gap-12 md:pl-0",
                  left ? "" : "md:[&>*:first-child]:col-start-2"
                )}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "group py-4",
                    left ? "md:pr-12 md:text-right" : "md:pl-12"
                  )}
                >
                  <div className="glass glass-sheen inline-block rounded-glass p-5 transition-all duration-500 ease-calm hover:-translate-y-0.5 hover:shadow-glass-lg">
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        left && "md:flex-row-reverse"
                      )}
                    >
                      <Icon
                        className={cn("h-3.5 w-3.5", iconClass)}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-rosewood-400">
                        {item.period}
                      </span>
                    </div>
                    <h4 className="mt-2 font-display text-lg font-semibold text-lavender-50">
                      {item.title}
                    </h4>
                    {item.detail && (
                      <p className="mt-1 text-sm text-lavender-100/85">
                        {item.detail}
                      </p>
                    )}
                    <span className="sr-only">{label}</span>
                  </div>
                </motion.div>

                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "absolute left-[5px] top-9 h-3.5 w-3.5 rounded-full border-2 border-navy-900 md:left-1/2 md:-translate-x-1/2",
                    dotClass
                  )}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
