import { Star, GitFork, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Live from the GitHub REST API, fetched on the server so no token is exposed
 * and the client ships no fetching code.
 *
 * Revalidated hourly: this is a portfolio, not a dashboard, and the unauthenticated
 * API allows 60 requests/hour per IP. Caching keeps us far under that and means a
 * GitHub outage can't take the section down.
 */
interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
}

async function getRepos(user: string): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;

    const repos = (await res.json()) as Repo[];
    return repos.filter((r) => !r.fork);
  } catch {
    return null;
  }
}

export async function GitHubActivity({ githubUser }: { githubUser: string }) {
  if (!githubUser) return null;
  const repos = await getRepos(githubUser);

  // The section is meaningless without data; drop it rather than render an
  // empty shell or invent numbers.
  if (!repos || repos.length === 0) return null;

  const top = repos.slice(0, 6);

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];
  const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  const mostRecent = repos[0]?.updated_at
    ? new Date(repos[0].updated_at).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  // A stat reading "0" advertises an absence. Drop empty ones and let the
  // remaining grid re-flow rather than pad it out.
  const stats = [
    { label: "Public repositories", value: String(repos.length) },
    { label: "Languages used", value: String(languages.length) },
    stars > 0
      ? { label: "Stars earned", value: String(stars) }
      : mostRecent
        ? { label: "Last pushed", value: mostRecent }
        : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  return (
    <section id="github" className="content-grid scroll-mt-24 py-32 md:py-44">
      <SectionHeading
        index="06 — In the open"
        title="Everything I build is public"
        lede="Pulled live from the GitHub API, refreshed hourly. Not a screenshot."
      />

      <div className="mt-14 grid gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} variant="up" delay={i * 0.08}>
            <div className="glass glass-sheen rounded-glass px-6 py-7">
              <div className="font-display text-display-sm font-bold text-gradient">
                {s.value}
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-lavender-200/50">
                {s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((repo, i) => (
          <Reveal key={repo.name} variant="up" delay={(i % 3) * 0.07} className="h-full">
            <li className="h-full list-none">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer noopener"
                className="glass glass-sheen group flex h-full flex-col rounded-glass p-5 transition-all duration-500 ease-calm hover:-translate-y-1 hover:shadow-glass-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-mono text-sm text-lavender-50 transition-colors group-hover:text-pink-300">
                    {repo.name}
                  </h3>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-lavender-200/40 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pink-300"
                    aria-hidden="true"
                  />
                </div>

                {repo.description && (
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-lavender-100/50">
                    {repo.description}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-4 pt-5 text-[11px] text-lavender-200/45">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden="true" />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" aria-hidden="true" />
                      {repo.stargazers_count}
                    </span>
                  )}
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" aria-hidden="true" />
                      {repo.forks_count}
                    </span>
                  )}
                </div>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
