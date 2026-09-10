"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { About as AboutData, Identity } from "@/lib/content";

interface Props { about: AboutData; identity: Pick<Identity, "portrait" | "name">; }

export function About({ about, identity }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const portraitY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.7, 0]);

  return (
    <section id="about" ref={ref} className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="01 — About"
        title="Where art, science and technology meet"
      />

      <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-[0.85fr_1fr] md:gap-16">
        <motion.div style={{ y: portraitY }} className="relative">
          <motion.div
            aria-hidden="true"
            style={{ opacity: glowOpacity }}
            className="absolute -inset-8 rounded-[3rem] bg-violet-400/25 blur-3xl"
          />
          <Reveal variant="blur">
            <div className="glass glass-sheen relative overflow-hidden rounded-glass-lg p-2 shadow-glass-lg">
              <Image
                src={identity.portrait}
                alt={`Portrait of ${identity.name}`}
                width={520}
                height={650}
                priority
                sizes="(max-width: 768px) 90vw, 40vw"
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>
          </Reveal>
        </motion.div>

        <div className="flex flex-col justify-center">
          <Reveal variant="up">
            <p className="font-display text-display-sm font-medium leading-snug text-lavender-50">
              {about.lede}
            </p>
          </Reveal>

          <div className="mt-8 space-y-5">
            {about.body.map((para, i) => (
              <Reveal key={i} variant="up" delay={0.1 + i * 0.08}>
                <p className="text-body-lg text-lavender-100/90">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
