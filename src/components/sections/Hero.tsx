"use client";

import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import type { Identity } from "@/lib/content";

export function Hero({ identity }: { identity: Identity }) {
  const { name, role, location, email, github, linkedin } = identity;
  const words = name.split(" ");
  return (
    <section className="content-grid relative min-h-dvh place-content-center py-32">
      {/* The visible name is decorative composition; this is what gets announced. */}
      <h1 className="sr-only">
        {name} — {role}
      </h1>

      <div className="relative">
        <motion.p
          className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.32em] text-rosewood-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {location}
        </motion.p>

        <div aria-hidden="true" className="space-y-1">
          {words.map((word, i) => (
            <div key={word} className="overflow-hidden py-[0.08em]">
              <motion.span
                className="block font-display text-display-xl font-extrabold text-rosewood-400"
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.15,
                  delay: 0.3 + i * 0.11,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        <motion.div
          className="mt-10 flex max-w-xl flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-body-lg text-lavender-100/90">
            {role} & Information Systems Graduate <br /> Building modern website and mobile app powered by data, technology, and machine learning.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Magnetic strength={0.35}>
              <a
                href="#work"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-400 to-pink-300 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-glow transition-transform duration-500 ease-calm hover:scale-[1.03]"
              >
                <span className="relative z-10">See the work</span>
                <ArrowDown className="relative z-10 h-4 w-4 transition-transform duration-500 ease-calm group-hover:translate-y-0.5" />
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                href="#contact"
                className="glass glass-sheen inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-lavender-100 transition-colors duration-500 ease-calm hover:bg-lagoon-50/[0.1]"
              >
                Get in touch
              </a>
            </Magnetic>

            <div className="ml-2 flex items-center gap-1">
              {[
                { href: github, Icon: Github, label: "GitHub" },
                { href: linkedin, Icon: Linkedin, label: "LinkedIn" },
                { href: `mailto:${email}`, Icon: Mail, label: "Email" },
              ].map(({ href, Icon, label }) => (
                <Magnetic key={label} strength={0.5}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full text-lavender-200/70 transition-colors duration-300 hover:text-pink-300"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-hidden="true"
      >
        <div className="h-14 w-px overflow-hidden bg-lagoon-50/10">
          <motion.div
            className="h-1/2 w-full bg-gradient-to-b from-transparent to-pink-300"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
