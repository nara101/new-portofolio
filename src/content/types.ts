/**
 * Every piece of site copy is tagged with its provenance.
 *
 *   "real"        - verified content from the previous site or a live source.
 *   "placeholder" - invented filler awaiting replacement by Nabila.
 *
 * The tag is not decorative. `scripts/check-placeholders.mjs` refuses to
 * produce a production build while any `placeholder` entry survives, so filler
 * cannot silently ship. Fabricated testimonials, metrics and awards on a
 * portfolio are the kind of claim a recruiter verifies, so the failure mode
 * this guards against is a real one.
 */
export type Provenance = "real" | "placeholder";

export interface Sourced<T> {
  provenance: Provenance;
  data: T;
}

/** Marks content as verified. */
export const real = <T,>(data: T): Sourced<T> => ({ provenance: "real", data });

/** Marks content as filler. Blocks `npm run build` until replaced. */
export const placeholder = <T,>(data: T): Sourced<T> => ({
  provenance: "placeholder",
  data,
});

export interface TimelineEntry {
  period: string;
  title: string;
  detail?: string;
  kind: "education" | "experience" | "organization" | "other";
}

export interface Certificate {
  title: string;
  issuer: string;
  file: string;
  year?: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  liveUrl?: string;
  repoUrl?: string;
  stack: string[];
  screenshot?: string;
  challenge?: string;
  solution?: string;
}

export type SkillClusterId =
  | "languages"
  | "ai"
  | "web"
  | "tools"
  | "mobile"
  | "game";

export interface Skill {
  name: string;
  /** Cluster drives constellation grouping, not a proficiency claim. */
  cluster: SkillClusterId;
  note: string;
}

export interface SkillCluster {
  id: SkillClusterId;
  label: string;
  visible: boolean;
  sort_order: number;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Achievement {
  label: string;
  value: string;
  detail: string;
}
