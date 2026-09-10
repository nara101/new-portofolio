"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, AlertCircle, Github, Linkedin, Download } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Magnetic } from "@/components/ui/Magnetic";
import type { Identity } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Interaction signature: the form dissolves into a confirmation on success.
 *
 * Submits to the same Formspree endpoint the previous site used, but over fetch
 * rather than a native POST — the old version navigated away to a Formspree page,
 * which threw away the whole session. Here you never leave.
 */
const FORMSPREE = "https://formspree.io/f/myzyrbvp";

export function Contact({ identity }: { identity: Identity }) {
  const { email, github, linkedin, cv } = identity;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setError("");

    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      const body = (await res.json().catch(() => null)) as
        | { errors?: { message: string }[] }
        | null;
      setError(body?.errors?.[0]?.message ?? "That didn't send. Try again?");
      setStatus("error");
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="07 — Contact"
        title="Say hello"
        lede="Open to internships, junior roles, and collaboration. I read everything that arrives here."
      />

      <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-[1fr_0.85fr] md:gap-16">
        <div className="glass glass-sheen rounded-glass-lg p-6 shadow-glass-lg md:p-8">
          <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid min-h-[22rem] place-items-center text-center"
                role="status"
                aria-live="polite"
              >
                <div>
                  <motion.div
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-pink-300"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Check className="h-6 w-6 text-navy-900" aria-hidden="true" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-display-sm font-semibold text-lavender-50">
                    It&apos;s on its way
                  </h3>
                  <p className="mt-2.5 text-sm text-lavender-100/60">
                    Thanks for writing. I&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-7 text-xs text-pink-300 underline underline-offset-4"
                  >
                    Send another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="name" label="Name" type="text" autoComplete="name" />
                  <Field name="email" label="Email" type="email" autoComplete="email" />
                </div>
                <Field name="subject" label="Subject" type="text" />
                <Field name="message" label="Message" textarea />

                {status === "error" && (
                  <p
                    className="flex items-center gap-2 text-xs text-pink-300"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                )}

                <Magnetic strength={0.25} className="inline-block pt-1">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-400 to-pink-300 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-glow transition-all duration-500 ease-calm hover:scale-[1.03] disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send message"}
                    <Send
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-calm group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </Magnetic>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col justify-center gap-8">
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rosewood-400">
              Direct
            </h3>
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block break-all font-display text-lg text-lavender-50 transition-colors hover:text-pink-300"
            >
              {email}
            </a>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rosewood-400">
              Elsewhere
            </h3>
            <div className="mt-3 flex gap-2">
              {[
                { href: github, Icon: Github, label: "GitHub" },
                { href: linkedin, Icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-lavender-100 transition-colors duration-300 hover:text-rosewood-400"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rosewood-400">
              Résumé
            </h3>
            <a
              href={cv}
              download
              className="glass glass-sheen group mt-3 inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-medium text-lavender-100 transition-all duration-500 ease-calm hover:-translate-y-0.5 hover:shadow-glass-lg"
            >
              <Download
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
              Download CV (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  textarea = false,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const id = `contact-${name}`;
  const shared =
    "peer w-full rounded-xl border border-lagoon-50/10 bg-lagoon-50/[0.04] px-4 pb-2.5 pt-6 text-sm text-lavender-50 outline-none transition-colors duration-300 placeholder:text-transparent focus:border-violet-400/50 focus:bg-lagoon-50/[0.07]";

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required
          placeholder={label}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          placeholder={label}
          className={shared}
        />
      )}
      {/* Float-label: rides up on focus or when filled. The placeholder is kept
          transparent rather than removed so :placeholder-shown still works. */}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 text-xs text-lavender-200/50 transition-all duration-300 ease-calm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-violet-300 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
      </label>
    </div>
  );
}
