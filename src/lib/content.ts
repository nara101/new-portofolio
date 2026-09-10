import { dbGet, dbAll } from "./db";
import type {
  Achievement,
  Certificate,
  Project,
  Skill,
  SkillCluster,
  SkillClusterId,
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

export async function getTheme(): Promise<Theme> {
  const r = await dbGet<Record<string, string>>(
    `SELECT color_bg, color_text, color_text_muted, color_accent, color_accent_soft,
            color_accent_nature, color_accent_sky, color_ink_dark,
            font_display, font_body, font_mono
       FROM theme WHERE id = 1`
  );
  return {
    colorBg: r!.color_bg,
    colorText: r!.color_text,
    colorTextMuted: r!.color_text_muted,
    colorAccent: r!.color_accent,
    colorAccentSoft: r!.color_accent_soft,
    colorAccentNature: r!.color_accent_nature,
    colorAccentSky: r!.color_accent_sky,
    colorInkDark: r!.color_ink_dark,
    fontDisplay: r!.font_display,
    fontBody: r!.font_body,
    fontMono: r!.font_mono,
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

export async function getIdentity(): Promise<Identity> {
  const row = await dbGet<Identity>(
    "SELECT name, role, location, email, linkedin, github, github_user as githubUser, cv, portrait FROM identity WHERE id = 1"
  );
  return row!;
}

export async function getAbout(): Promise<About> {
  const row = await dbGet<{ lede: string; body_json: string }>(
    "SELECT lede, body_json FROM about WHERE id = 1"
  );
  return { lede: row!.lede, body: JSON.parse(row!.body_json) };
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  const rows = await dbAll<Record<string, unknown>>(
    "SELECT period, title, detail, kind FROM timeline ORDER BY sort_order, id"
  );
  return rows.map((r) => ({
    period: r.period as string,
    title: r.title as string,
    detail: (r.detail as string) ?? undefined,
    kind: r.kind as TimelineEntry["kind"],
  }));
}

export async function getCertificates(): Promise<Certificate[]> {
  const rows = await dbAll<Record<string, unknown>>(
    "SELECT title, issuer, file, year FROM certificates ORDER BY sort_order, id"
  );
  return rows.map((r) => ({
    title: r.title as string,
    issuer: r.issuer as string,
    file: r.file as string,
    year: (r.year as string) ?? undefined,
  }));
}

export async function getProjects(): Promise<Project[]> {
  const rows = await dbAll<Record<string, unknown>>(
    `SELECT slug, name, tagline, description, live_url as liveUrl, repo_url as repoUrl,
            stack_json, screenshot, challenge, solution
       FROM projects ORDER BY sort_order, id`
  );
  return rows.map((r) => ({
    slug: r.slug as string,
    name: r.name as string,
    tagline: r.tagline as string,
    description: r.description as string,
    liveUrl: (r.liveUrl as string) ?? undefined,
    repoUrl: (r.repoUrl as string) ?? undefined,
    stack: JSON.parse(r.stack_json as string),
    screenshot: (r.screenshot as string) ?? undefined,
    challenge: (r.challenge as string) ?? undefined,
    solution: (r.solution as string) ?? undefined,
  }));
}

export async function getSkills(): Promise<Skill[]> {
  return (await dbAll<Skill>(
    "SELECT name, cluster, note FROM skills ORDER BY sort_order, id"
  ));
}

export async function getSkillClusters(): Promise<SkillCluster[]> {
  const rows = await dbAll<Record<string, unknown>>(
    "SELECT id, label, visible, sort_order FROM skill_clusters ORDER BY sort_order, id"
  );
  return rows.map((r) => ({
    id: r.id as SkillClusterId,
    label: r.label as string,
    visible: !!r.visible,
    sort_order: r.sort_order as number,
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await dbAll<Testimonial>(
    "SELECT quote, name, role FROM testimonials ORDER BY sort_order, id"
  ));
}

export async function getAchievements(): Promise<Achievement[]> {
  return (await dbAll<Achievement>(
    "SELECT label, value, detail FROM achievements ORDER BY sort_order, id"
  ));
}

export async function getAllContent(): Promise<PortfolioContent> {
  const [identity, about, timeline, certificates, projects, skills, skillClusters, testimonials, achievements] =
    await Promise.all([
      getIdentity(),
      getAbout(),
      getTimeline(),
      getCertificates(),
      getProjects(),
      getSkills(),
      getSkillClusters(),
      getTestimonials(),
      getAchievements(),
    ]);
  return { identity, about, timeline, certificates, projects, skills, skillClusters, testimonials, achievements };
}
