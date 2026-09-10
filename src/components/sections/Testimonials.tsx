import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { Testimonial } from "@/content/types";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="06 — Words"
        title="What people say"
        lede="From mentors, teammates and the people I've built things for."
      />

      <ul className="mt-14 grid gap-4 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={`${t.name}-${i}`} variant="up" delay={i * 0.08} className="h-full">
            <li className="glass glass-sheen flex h-full list-none flex-col rounded-glass-lg p-7">
              <Quote className="h-5 w-5 text-rosewood-400/50" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-body-md leading-relaxed text-lagoon-100/75">
                {t.quote}
              </blockquote>
              <footer className="mt-6 border-t border-lagoon-900/8 pt-4">
                <div className="font-display text-sm font-semibold text-lagoon-50">
                  {t.name}
                </div>
                <div className="mt-0.5 text-xs text-lagoon-200/70">{t.role}</div>
              </footer>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
