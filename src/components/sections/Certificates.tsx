"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion, useFinePointer } from "@/lib/useReducedMotion";
import type { Certificate } from "@/content/types";

/**
 * Interaction signature: a museum wall. Cards are lit by a specular highlight
 * that tracks the pointer across the card face, and tilt very slightly toward
 * it. Clicking opens the actual PDF in a modal viewer.
 *
 * Tilt is capped at 6deg. Past roughly 8deg the text on the card starts to
 * shear visibly and it reads as a gimmick.
 */
export function Certificates({ certificates }: { certificates: Certificate[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = certificates;

  return (
    <section id="certificates" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="05 — Credentials"
        title="All the certificates I have"
        lede="Click any one to read the actual document."
      />

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
        {items.map((cert, i) => (
          <CertCard key={cert.file} cert={cert} index={i} onOpen={() => setOpen(i)} />
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && (
          <PdfModal
            key={items[open].file}
            title={items[open].title}
            file={items[open].file}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function CertCard({
  cert,
  index,
  onOpen,
}: {
  cert: { title: string; issuer: string; file: string; year?: string };
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const enabled = fine && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({
      rx: (0.5 - py) * 12,
      ry: (px - 0.5) * 12,
      mx: px * 100,
      my: py * 100,
    });
  };

  const reset = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });

  return (
    <li>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000 }}
      >
        <button
          ref={ref}
          type="button"
          onClick={onOpen}
          onPointerMove={onMove}
          onPointerLeave={reset}
          data-cursor="view"
          className="glass glass-sheen group relative block h-full w-full overflow-hidden rounded-glass p-6 text-left shadow-glass transition-shadow duration-500 ease-calm hover:shadow-glass-lg"
          style={{
            transform: enabled
              ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
              : undefined,
            transformStyle: "preserve-3d",
            transition: "transform 400ms cubic-bezier(0.22,1,0.36,1), box-shadow 500ms",
          }}
        >
          {/* Specular sweep following the pointer. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(18rem 18rem at ${tilt.mx}% ${tilt.my}%, rgb(255 255 255 / 0.14), transparent 60%)`,
            }}
          />

          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-rosewood-400">
            {cert.issuer}
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-lavender-50">
            {cert.title}
          </h3>
          <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-lavender-100/85 transition-colors duration-300 group-hover:text-rosewood-400">
            Open certificate
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </span>
        </button>
      </motion.div>
    </li>
  );
}

function PdfModal({
  title,
  file,
  onClose,
}: {
  title: string;
  file: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Escape to close, and lock the body so the page behind cannot scroll away.
  // A dialog that leaves the background scrollable is disorienting on trackpads.
  useModalBehaviour(onClose, ref);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] grid place-items-center bg-navy-950/80 p-4 backdrop-blur-md md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={ref}
        className="glass glass-sheen relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-glass-lg shadow-lift"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-lagoon-50/8 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-lavender-50">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={file}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-lagoon-50/12 px-3.5 py-1.5 text-xs text-lavender-100/70 transition-colors hover:text-lavender-50"
            >
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              autoFocus
              className="grid h-8 w-8 place-items-center rounded-full text-lavender-200/70 transition-colors hover:bg-lagoon-50/10 hover:text-lavender-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <object
          data={`${encodeURI(file)}#view=FitH`}
          type="application/pdf"
          className="h-full w-full flex-1 bg-navy-800"
          aria-label={`${title} certificate document`}
        >
          {/* iOS Safari and some Android browsers will not inline a PDF. */}
          <div className="grid h-full place-items-center p-8 text-center">
            <p className="text-sm text-lavender-100/70">
              Your browser can&apos;t display this PDF inline.{" "}
              <a href={file} target="_blank" rel="noreferrer noopener" className="text-pink-300 underline">
                Open it in a new tab
              </a>
              .
            </p>
          </div>
        </object>
      </motion.div>
    </motion.div>
  );
}

/** Escape-to-close, scroll lock, and focus containment for the PDF dialog. */
function useModalBehaviour(
  onClose: () => void,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;

      // Trap focus inside the dialog.
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, ref]);
}
