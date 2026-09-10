"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Skill, SkillCluster, SkillClusterId } from "@/content/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * Constellation of skills grouped by cluster. Which clusters are visible is
 * driven by the DB (studio → Skills Clusters), so the site owner can trim it
 * down when applying for a specific role (e.g. show only Web + Languages +
 * Tools for a web-dev application).
 *
 * Layout is arranged automatically for however many clusters are visible
 * (1..6), so removing a cluster doesn't leave a gap.
 */

// One palette color per cluster. The "game" cluster uses Vanilla Cream — the
// same value as the page background — so it needs a subtle outline to stay
// visible. Non-cream clusters get no stroke; the cream one draws a soft
// rosewood ring around each node/pill so it reads without being loud.
const CLUSTER_STYLE: Record<SkillClusterId, { fill: string; stroke?: string }> = {
  languages: { fill: "rgb(var(--theme-accent-soft))" }, // Blush Petal
  ai:        { fill: "rgb(var(--theme-accent))" },       // Rosewood
  web:       { fill: "rgb(var(--theme-accent-nature))" },// Sage Leaf
  tools:     { fill: "rgb(var(--theme-accent-sky))" },   // Misty Sky
  mobile:    { fill: "rgb(var(--fg))" },                 // Midnight Lagoon
  game:      { fill: "rgb(var(--bg-deep))", stroke: "rgb(var(--theme-accent) / 0.55)" }, // Vanilla Cream w/ soft rosewood outline
};

interface Positioned {
  id: SkillClusterId;
  label: string;
  cx: number;
  cy: number;
  color: string;
  stroke?: string;
}

interface Node extends Skill {
  x: number;
  y: number;
  color: string;
  stroke?: string;
  clusterLabel: string;
}

// Ring of anchor positions around the canvas centre. Slice the ring to however
// many clusters we're actually drawing so they stay balanced.
function positions(count: number): Array<{ cx: number; cy: number }> {
  if (count === 1) return [{ cx: 50, cy: 50 }];
  const R = 26;
  const CX = 50;
  const CY = 50;
  // start at top-left so 4 clusters land in the familiar quadrant layout
  const start = -Math.PI * 0.75;
  return Array.from({ length: count }, (_, i) => {
    const a = start + (i / count) * Math.PI * 2;
    return { cx: CX + Math.cos(a) * R, cy: CY + Math.sin(a) * R };
  });
}

export function Skills({
  skills,
  skillClusters,
}: {
  skills: Skill[];
  skillClusters: SkillCluster[];
}) {
  const [active, setActive] = useState<string | null>(null);

  // Only draw clusters the owner has enabled AND that have at least one skill.
  const clusters = useMemo<Positioned[]>(() => {
    const visible = skillClusters.filter(
      (c) => c.visible && skills.some((s) => s.cluster === c.id)
    );
    const pos = positions(visible.length);
    return visible.map((c, i) => {
      const style = CLUSTER_STYLE[c.id] ?? { fill: "rgb(var(--theme-accent))" };
      return {
        id: c.id,
        label: c.label,
        cx: pos[i].cx,
        cy: pos[i].cy,
        color: style.fill,
        stroke: style.stroke,
      };
    });
  }, [skillClusters, skills]);

  const nodes = useMemo<Node[]>(() => {
    return clusters.flatMap((cluster) => {
      const members = skills.filter((s) => s.cluster === cluster.id);
      const radius = clusters.length > 4 ? 9 : 11;
      return members.map((skill, i) => {
        const angle = (i / Math.max(1, members.length)) * Math.PI * 2 + cluster.cx;
        return {
          ...skill,
          x: cluster.cx + Math.cos(angle) * radius,
          y: cluster.cy + Math.sin(angle) * radius * 0.86,
          color: cluster.color,
          stroke: cluster.stroke,
          clusterLabel: cluster.label,
        };
      });
    });
  }, [clusters, skills]);

  const activeNode = nodes.find((n) => n.name === active) ?? null;

  return (
    <section id="skills" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="03 — Skills"
        title="A constellation, not a scoreboard"
        lede="Percentages would be made up. These are grouped by what they're for — hover or tab through to see where each one comes from."
      />

      <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-[1.4fr_1fr] md:gap-14">
        <div className="glass glass-sheen relative aspect-square overflow-hidden rounded-glass-lg shadow-glass-lg md:aspect-[4/3.4]">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            aria-hidden="true"
            focusable="false"
          >
            {clusters.map((c) => (
              <circle
                key={c.id}
                cx={c.cx}
                cy={c.cy}
                r={14}
                fill={c.color}
                stroke={c.stroke}
                strokeWidth={c.stroke ? 0.35 : 0}
                opacity={c.stroke ? 0.35 : 0.08}
              />
            ))}

            {clusters.map((c) => {
              const members = nodes.filter((n) => n.cluster === c.id);
              if (members.length < 2) return null;
              // Cream-fill clusters use their outline color for the connecting
              // lines instead of the invisible fill.
              const lineStroke = c.stroke ?? c.color;
              return members.map((n, i) => {
                const next = members[(i + 1) % members.length];
                const lit = active === n.name || active === next.name;
                return (
                  <line
                    key={`${n.name}-${next.name}`}
                    x1={n.x}
                    y1={n.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={lineStroke}
                    strokeWidth={lit ? 0.35 : 0.18}
                    opacity={active ? (lit ? 0.7 : 0.1) : 0.28}
                    className="transition-all duration-500"
                  />
                );
              });
            })}

            {nodes.map((n, i) => {
              const isActive = active === n.name;
              const dimmed = active !== null && !isActive;
              return (
                <motion.g
                  key={n.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isActive ? 4.5 : 2.6}
                    fill={n.color}
                    stroke={n.stroke}
                    strokeWidth={n.stroke ? 0.55 : 0}
                    opacity={dimmed ? 0.25 : 1}
                    className="transition-all duration-500"
                  />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isActive ? 7.5 : 4.5}
                    fill={n.color}
                    opacity={isActive ? 0.22 : 0}
                    className="transition-all duration-500"
                  />
                  <text
                    x={n.x}
                    y={n.y - 5.5}
                    textAnchor="middle"
                    fontSize={2.6}
                    fill="#2D3A47"
                    opacity={isActive ? 1 : dimmed ? 0.2 : 0.75}
                    className="transition-opacity duration-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {n.name}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-x-4 bottom-4">
            <motion.div
              animate={{ opacity: activeNode ? 1 : 0, y: activeNode ? 0 : 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-glass px-4 py-3"
            >
              <p className="text-xs text-lavender-100/80">
                <span className="font-semibold text-lavender-50">
                  {activeNode?.name}
                </span>
                {activeNode ? ` — ${activeNode.note}` : ""}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          {clusters.map((c) => (
            <div key={c.id}>
              <h3 className="mb-2.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-lavender-200/85">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: c.color,
                    boxShadow: c.stroke ? `inset 0 0 0 1px ${c.stroke}` : undefined,
                  }}
                />
                {c.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {nodes
                  .filter((n) => n.cluster === c.id)
                  .map((n) => (
                    <li key={n.name}>
                      <button
                        type="button"
                        onPointerEnter={() => setActive(n.name)}
                        onPointerLeave={() => setActive(null)}
                        onFocus={() => setActive(n.name)}
                        onBlur={() => setActive(null)}
                        aria-describedby={`skill-note-${n.name.replace(/\W/g, "")}`}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ease-calm",
                          active === n.name
                            ? "border-transparent bg-lagoon-50/16 text-lavender-50"
                            : "border-lagoon-50/25 text-lavender-100/85 hover:border-lagoon-50/40 hover:text-lavender-50"
                        )}
                      >
                        {n.name}
                      </button>
                      <span
                        id={`skill-note-${n.name.replace(/\W/g, "")}`}
                        className="sr-only"
                      >
                        {n.note}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
