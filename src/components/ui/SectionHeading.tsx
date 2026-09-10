import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  index,
  title,
  lede,
  className,
}: {
  index: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Reveal variant="up">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-rosewood-400">
          {index}
        </span>
      </Reveal>
      <Reveal variant="mask" delay={0.08}>
        <h2 className="mt-4 font-display text-display-md font-semibold text-lavender-50">
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal variant="up" delay={0.16}>
          <p className="mt-5 text-body-lg text-lavender-100/85">{lede}</p>
        </Reveal>
      )}
    </div>
  );
}
