"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Github, X } from "lucide-react";
import type { Project } from "@/content/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Interaction signature: full-bleed editorial rows. Hovering a row lifts its
 * title and slides a live preview in; opening one expands an inline case study
 * with a shared layout transition rather than a modal, so the project stays in
 * the flow of the page.
 *
 * Live previews are <iframe>s of the real deployed sites rather than
 * screenshots — the sites are static, public, and already on GitHub Pages, so
 * this stays honest and never goes stale. They are lazy and sandboxed.
 */
export function Work({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="work" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="04 — Work"
        title="Works I built and shipped"
        lede="Every one of these is live. Open a row to see what it is and what it's made of."
      />

      <ul className="mt-16 md:mt-20">
        {projects.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={project}
            index={i}
            isOpen={open === project.slug}
            onToggle={() =>
              setOpen((cur) => (cur === project.slug ? null : project.slug))
            }
          />
        ))}
      </ul>
    </section>
  );
}

function ProjectRow({
  project,
  index,
  isOpen,
  onToggle,
}: {
  project: Project;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  const panelId = `project-panel-${project.slug}`;

  return (
    <li className="border-t border-lagoon-50/30 last:border-b">
      <button
        type="button"
        onClick={onToggle}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group relative flex w-full items-center justify-between gap-6 py-8 text-left md:py-10"
      >
        {/* Hover wash. Sits behind content, bleeds past the measure. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 -inset-x-6 -z-10 rounded-glass bg-gradient-to-r from-violet-400/10 to-transparent transition-opacity duration-700 ease-calm",
            hovered || isOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="flex min-w-0 items-baseline gap-5 md:gap-8">
          <span className="font-mono text-sm font-semibold text-rosewood-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-display text-display-sm font-semibold transition-colors duration-500 ease-calm",
                hovered || isOpen ? "text-rosewood-400" : "text-lavender-50",
              )}
            >
              {project.name}
            </h3>
            <p className="mt-1.5 truncate text-sm text-lavender-100/80">
              {project.tagline}
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lagoon-50/40 transition-all duration-500 ease-calm",
            isOpen
              ? "rotate-90 bg-rosewood-400 text-cream-100"
              : "text-lavender-200 group-hover:border-rosewood-400 group-hover:text-rosewood-400",
          )}
        >
          {isOpen ? <X className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
        </span>
      </button>

      {/* AnimatePresence tracks children by key; without one it cannot register
          the mount and the panel stays frozen at its `initial` values. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={panelId}
            id={panelId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-12 md:grid-cols-[1.15fr_1fr] md:gap-12">
              {/* Live preview of the real deployed site. */}
              <div
                data-cursor="view"
                className="glass glass-sheen relative aspect-[16/10] overflow-hidden rounded-glass shadow-glass-lg"
              >
                {project.liveUrl && (
                  <iframe
                    src={project.liveUrl}
                    title={`Live preview of ${project.name}`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer"
                    // Rendered at desktop width then scaled down, so the preview
                    // shows the desktop layout rather than a phone breakpoint.
                    className="h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-navy-800"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>

              <div className="flex flex-col justify-center gap-6">
                <p className="text-body-md text-lavender-100/90">
                  {project.description}
                </p>

                <div>
                  <h4 className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rosewood-400">
                    Built with
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-lagoon-50/30 px-3 py-1 text-xs text-lavender-100"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-rosewood-400 px-5 py-2.5 text-xs font-semibold text-cream-100 transition-colors duration-300 hover:bg-rosewood-500"
                    >
                      Visit live site
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-lagoon-50/40 px-5 py-2.5 text-xs font-medium text-lavender-100 transition-colors duration-300 hover:border-rosewood-400 hover:text-rosewood-400"
                    >
                      <Github className="h-3.5 w-3.5" aria-hidden="true" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
