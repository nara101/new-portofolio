import { Reveal } from "@/components/ui/Reveal";
import type { Identity } from "@/lib/content";

export function Ending({ identity }: { identity: Identity }) {
  const year = new Date().getFullYear();

  return (
    <footer className="content-grid relative overflow-hidden py-24 md:py-32">
      <Reveal variant="blur">
        <div className="border-t border-lagoon-50/30 pt-16 text-center">
          <p className="font-display text-display-sm font-medium text-lavender-100/75">
            Still here?
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-lavender-100/85">
            Then you&apos;ve seen everything. Thanks for the time — that&apos;s the
            most expensive thing anyone can give a portfolio.
          </p>

          <a
            href={`mailto:${identity.email}`}
            className="mt-10 inline-block font-display text-display-md font-bold text-rosewood-400 transition-opacity duration-500 hover:opacity-80"
          >
            Let&apos;s talk
          </a>

          <div className="mt-20 flex flex-col items-center justify-between gap-3 text-[11px] text-lavender-200/75 sm:flex-row">
            <span>
              © {year} {identity.name}
            </span>
            <span className="font-mono">
              Built with Next.js, Tailwind, GSAP &amp; Framer Motion
            </span>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
