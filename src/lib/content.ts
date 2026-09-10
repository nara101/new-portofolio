import { db } from "./db";
import type {
  Achievement,
  Certificate,
  Project,
  Skill,
  SkillCluster,
  TimelineEntry,
  Testimonial,
} from "@/content/types";

export interface Identity {
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  githubUser: string;
  cv: string;
  portrait: string;
}

export interface About {
  lede: string;
  body: string[];
}

export interface Theme {
  colorBg: string;
  colorText: string;
  colorTextMuted: string;
  colorAccent: string;
  colorAccentSoft: string;
  colorAccentNature: string;
  colorAccentSky: string;
  colorInkDark: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}

export function getTheme(): Theme {
  const r = db()
    .prepare(
      `SELECT color_bg, color_text, color_text_muted, color_accent, color_accent_soft,
              color_accent_nature, color_accent_sky, color_ink_dark,
              font_display, font_body, font_mono
         FROM theme WHERE id = 1`
    )
    .get() as any;
  return {
    colorBg: r.color_bg,
    colorText: r.color_text,
    colorTextMuted: r.color_text_muted,
    colorAccent: r.color_accent,
    colorAccentSoft: r.color_accent_soft,
    colorAccentNature: r.color_accent_nature,
    colorAccentSky: r.color_accent_sky,
    colorInkDark: r.color_ink_dark,
    fontDisplay: r.font_display,
    fontBody: r.font_body,
    fontMono: r.font_mono,
  };
}

export interface PortfolioContent {
  identity: Identity;
  about: About;
  timeline: TimelineEntry[];
  certificates: Certificate[];
  projects: Project[];
  skills: Skill[];
  skillClusters: SkillCluster[];
  testimonials: Testimonial[];
  achievements: Achievement[];
}

export function getIdentity(): Identity {
  const row = db()
    .prepare(
      "SELECT name, role, location, email, linkedin, github, github_user as githubUser, cv, portrait FROM identity WHERE id = 1"
    )
    .get() as Identity;
  return row;
}

export function getAbout(): About {
  const row = db()
    .prepare("SELECT lede, body_json FROM about WHERE id = 1")
    .get() as { lede: string; body_json: string };
  return { lede: row.lede, body: JSON.parse(row.body_json) };
}

export function getTimeline(): TimelineEntry[] {
  return db()
    .prepare(
      "SELECT period, title, detail, kind FROM timeline ORDER BY sort_order, id"
    )
    .all()
    .map((r: any) => ({
      period: r.period,
      title: r.title,
      detail: r.detail ?? undefined,
      kind: r.kind,
    }));
}

export function getCertificates(): Certificate[] {
  return db()
    .prepare(
      "SELECT title, issuer, file, year FROM certificates ORDER BY sort_order, id"
    )
    .all()
    .map((r: any) => ({
      title: r.title,
      issuer: r.issuer,
      file: r.file,
      year: r.year ?? undefined,
    }));
}

export function getProjects(): Project[] {
  return db()
    .prepare(
      `SELECT slug, name, tagline, description, live_url as liveUrl, repo_url as repoUrl,
              stack_json, screenshot, challenge, solution
         FROM projects ORDER BY sort_order, id`
    )
    .all()
    .map((r: any) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      liveUrl: r.liveUrl ?? undefined,
      repoUrl: r.repoUrl ?? undefined,
      stack: JSON.parse(r.stack_json),
      screenshot: r.screenshot ?? undefined,
      challenge: r.challenge ?? undefined,
      solution: r.solution ?? undefined,
    }));
}

export function getSkills(): Skill[] {
  return db()
    .prepare("SELECT name, cluster, note FROM skills ORDER BY sort_order, id")
    .all() as Skill[];
}

export function getSkillClusters(): SkillCluster[] {
  return db()
    .prepare(
      "SELECT id, label, visible, sort_order FROM skill_clusters ORDER BY sort_order, id"
    )
    .all()
    .map((r: any) => ({
      id: r.id,
      label: r.label,
      visible: !!r.visible,
      sort_order: r.sort_order,
    }));
}

export function getTestimonials(): Testimonial[] {
  return db()
    .prepare("SELECT quote, name, role FROM testimonials ORDER BY sort_order, id")
    .all() as Testimonial[];
}

export function getAchievements(): Achievement[] {
  return db()
    .prepare("SELECT label, value, detail FROM achievements ORDER BY sort_order, id")
    .all() as Achievement[];
}

export function getAllContent(): PortfolioContent {
  return {
    identity: getIdentity(),
    about: getAbout(),
    timeline: getTimeline(),
    certificates: getCertificates(),
    projects: getProjects(),
    skills: getSkills(),
    skillClusters: getSkillClusters(),
    testimonials: getTestimonials(),
    achievements: getAchievements(),
  };
}
