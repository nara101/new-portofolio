import { createClient, type Client, type InValue } from "@libsql/client";
import bcrypt from "bcryptjs";

let _client: Client | null = null;

function client(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Create a Turso database and set the URL in .env.local or Vercel environment variables."
    );
  }
  _client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return _client;
}

let _ready: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!_ready) _ready = bootstrap();
  return _ready;
}

async function bootstrap(): Promise<void> {
  const c = client();
  await init(c);
  await migrate(c);
  await seed(c);
}

async function init(c: Client) {
  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS identity (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT NOT NULL,
      linkedin TEXT NOT NULL,
      github TEXT NOT NULL,
      github_user TEXT NOT NULL,
      cv TEXT NOT NULL,
      portrait TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lede TEXT NOT NULL,
      body_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT,
      kind TEXT NOT NULL CHECK (kind IN ('education','experience','organization','other')),
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      file TEXT NOT NULL,
      year TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      live_url TEXT,
      repo_url TEXT,
      stack_json TEXT NOT NULL,
      screenshot TEXT,
      challenge TEXT,
      solution TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cluster TEXT NOT NULL CHECK (cluster IN ('languages','ai','web','tools','mobile','game')),
      note TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skill_clusters (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      detail TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS theme (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      color_bg TEXT NOT NULL,
      color_text TEXT NOT NULL,
      color_text_muted TEXT NOT NULL,
      color_accent TEXT NOT NULL,
      color_accent_soft TEXT NOT NULL,
      color_accent_nature TEXT NOT NULL,
      color_accent_sky TEXT NOT NULL,
      color_ink_dark TEXT NOT NULL,
      font_display TEXT NOT NULL,
      font_body TEXT NOT NULL,
      font_mono TEXT NOT NULL
    );
  `);
}

async function migrate(c: Client) {
  const tl = await c.execute(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='timeline'"
  );
  if (tl.rows.length > 0 && !(tl.rows[0].sql as string).includes("'other'")) {
    await c.executeMultiple(`
      CREATE TABLE timeline_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        kind TEXT NOT NULL CHECK (kind IN ('education','experience','organization','other')),
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO timeline_new (id, period, title, detail, kind, sort_order)
        SELECT id, period, title, detail, kind, sort_order FROM timeline;
      DROP TABLE timeline;
      ALTER TABLE timeline_new RENAME TO timeline;
    `);
    console.log("[db] Migrated timeline: added 'other' kind");
  }

  const sk = await c.execute(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='skills'"
  );
  if (sk.rows.length > 0) {
    const sql = sk.rows[0].sql as string;
    if (!sql.includes("'mobile'") || !sql.includes("'game'") || !sql.includes("'ai'")) {
      await c.executeMultiple(`
        CREATE TABLE skills_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          cluster TEXT NOT NULL CHECK (cluster IN ('languages','ai','web','tools','mobile','game')),
          note TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO skills_new (id, name, cluster, note, sort_order)
          SELECT id, name,
            CASE WHEN cluster='data' THEN 'ai' ELSE cluster END,
            note, sort_order
          FROM skills;
        DROP TABLE skills;
        ALTER TABLE skills_new RENAME TO skills;
      `);
      console.log("[db] Migrated skills: renamed data→ai, added mobile+game clusters");
    }
  }
}

async function seed(c: Client) {
  const userCount = await c.execute("SELECT COUNT(*) as c FROM users");
  if ((userCount.rows[0].c as number) === 0) {
    const email = process.env.ADMIN_EMAIL || "nabilaramadhanty11@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "changeme-nara-2026";
    const hash = bcrypt.hashSync(password, 10);
    await c.execute({
      sql: "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      args: [email, hash],
    });
    console.log(`[db] Seeded admin user: ${email}`);
  }

  const idCount = await c.execute("SELECT COUNT(*) as c FROM identity");
  if ((idCount.rows[0].c as number) === 0) {
    await c.execute({
      sql: `INSERT INTO identity (id, name, role, location, email, linkedin, github, github_user, cv, portrait)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "Nabila Ramadhanty",
        "Web Developer",
        "Makassar, Indonesia",
        "nabilaramadhanty11@gmail.com",
        "https://www.linkedin.com/in/nabilaramadhanty12/",
        "https://github.com/nara101",
        "nara101",
        "/pdf/Nabila Ramadhanty (2).pdf",
        "/images/nara2.jpg",
      ],
    });
  }

  const aboutCount = await c.execute("SELECT COUNT(*) as c FROM about");
  if ((aboutCount.rows[0].c as number) === 0) {
    await c.execute({
      sql: "INSERT INTO about (id, lede, body_json) VALUES (1, ?, ?)",
      args: [
        "A creative, hardworking person who is enthusiastic about learning new things — especially where art, science and technology meet.",
        JSON.stringify([
          "I have leadership experience and I'm comfortable leading a team. Reading and writing are my hobbies. I know and am still learning several programming languages, including Python and Java.",
          "I'm currently studying Information Systems at Hasanuddin University in Makassar.",
        ]),
      ],
    });
  }

  const tlCount = await c.execute("SELECT COUNT(*) as c FROM timeline");
  if ((tlCount.rows[0].c as number) === 0) {
    const rows: Array<[string, string, string | null, string]> = [
      ["2008 — 2014", "SD Inpres Toddopuli I Makassar", null, "education"],
      ["2014 — 2017", "SMPN 33 Makassar", null, "education"],
      ["2017 — 2020", "SMAN 3 Makassar", null, "education"],
      ["2020 — Present", "Hasanuddin University", "Information Systems", "education"],
      ["Feb 2023 — Jul 2023", "Bangkit Academy Cohort", "Google-led machine learning track", "experience"],
      ["Sep 2023 — Nov 2023", "Internship, Diskominfo-SP South Sulawesi", null, "experience"],
      ["Nov 2023", "Hackathon S8 2023", "Dispora Makassar × Binar", "experience"],
      ["Jun 2024 — Jul 2024", "Data Science Mentor", "Summer Club, Generation Girls", "experience"],
      ["Oct 2024", "Associate Data Scientist", "VSGA Digitalent", "experience"],
    ];
    await c.batch(
      rows.map((r, i) => ({
        sql: "INSERT INTO timeline (period, title, detail, kind, sort_order) VALUES (?, ?, ?, ?, ?)",
        args: [r[0], r[1], r[2], r[3], i],
      }))
    );
  }

  const certCount = await c.execute("SELECT COUNT(*) as c FROM certificates");
  if ((certCount.rows[0].c as number) === 0) {
    const rows: Array<[string, string, string, string | null]> = [
      ["Google Cybersecurity", "Google", "/pdf/G_cybersecurity.pdf", null],
      ["Google Data Analytics", "Google", "/pdf/G_dataanalytics.pdf", null],
      ["Google Digital Marketing", "Google", "/pdf/G_Digitalmarketing.pdf", null],
      ["TensorFlow Developer", "DeepLearning.AI", "/pdf/Tensorflow Developer.pdf", null],
      ["TensorFlow: Data and Deployment", "DeepLearning.AI", "/pdf/Tensorflow data deployment full.pdf", null],
      ["Machine Learning", "Stanford University", "/pdf/standford_ML.pdf", null],
      ["Mathematics for Machine Learning", "Imperial College London", "/pdf/Math for ML Certificate Complete.pdf", null],
      ["Leading People and Teams", "University of Michigan", "/pdf/Leading People and Teams full.pdf", null],
      ["Hackathon S8 2023", "Dispora Makassar × Binar", "/pdf/Hackathon S8 2023_Cert_Nabila Ramadhanty.pdf", "2023"],
    ];
    await c.batch(
      rows.map((r, i) => ({
        sql: "INSERT INTO certificates (title, issuer, file, year, sort_order) VALUES (?, ?, ?, ?, ?)",
        args: [r[0], r[1], r[2], r[3], i],
      }))
    );
  }

  const projCount = await c.execute("SELECT COUNT(*) as c FROM projects");
  if ((projCount.rows[0].c as number) === 0) {
    const rows = [
      {
        slug: "movie-web",
        name: "Movie Web App",
        tagline: "A browsable film catalogue driven by live TMDB data.",
        description:
          "A single-page movie browser that renders entirely from the TMDB API. Supports search plus four live category feeds — now playing, popular, top rated, and trending this week — with results rendered client-side from fetched JSON.",
        liveUrl: "https://nara101.github.io/movie-web/",
        repoUrl: "https://github.com/nara101/movie-web",
        stack: ["JavaScript", "TMDB API", "Fetch API", "CSS"],
      },
      {
        slug: "skylight-apartment",
        name: "Skylight Apartment",
        tagline: "A multi-page property site with scroll-driven motion.",
        description:
          "A five-page marketing site for an apartment complex, covering unit types, an about page, contact, and a blog. Uses scroll-triggered reveals and a responsive off-canvas navigation.",
        liveUrl: "https://nara101.github.io/apartment/",
        repoUrl: "https://github.com/nara101/apartment",
        stack: ["Bootstrap 5", "GSAP", "AOS", "JavaScript", "CSS"],
      },
      {
        slug: "desa-bulo-bulo",
        name: "Desa Bulo-Bulo",
        tagline: "A village profile site for Kecamatan Arungkeke.",
        description:
          "A public information site for Desa Bulo-Bulo covering village history, general information, and a photo gallery, fronted by a full-bleed image slider.",
        liveUrl: "https://nara101.github.io/webbulobulo.github.io/",
        repoUrl: "https://github.com/nara101/webbulobulo.github.io",
        stack: ["HTML", "CSS", "Swiper.js", "Boxicons"],
      },
      {
        slug: "desa-bulo-bulo-v2",
        name: "Website Desa Bulo-Bulo",
        tagline: "A second, multi-page take on the village site.",
        description:
          "A revised version of the village site, restructured from one page into several — history and population data each get their own page — on a Bootstrap layout with a sticky navigation bar.",
        liveUrl: "https://nara101.github.io/web.github.io/index.html",
        repoUrl: "https://github.com/nara101/web.github.io",
        stack: ["Bootstrap", "HTML", "CSS", "JavaScript"],
      },
    ];
    await c.batch(
      rows.map((p, i) => ({
        sql: `INSERT INTO projects (slug, name, tagline, description, live_url, repo_url, stack_json, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.slug, p.name, p.tagline, p.description, p.liveUrl, p.repoUrl, JSON.stringify(p.stack), i],
      }))
    );
  }

  const themeCount = await c.execute("SELECT COUNT(*) as c FROM theme");
  if ((themeCount.rows[0].c as number) === 0) {
    await c.execute({
      sql: `INSERT INTO theme (id, color_bg, color_text, color_text_muted, color_accent, color_accent_soft, color_accent_nature, color_accent_sky, color_ink_dark, font_display, font_body, font_mono)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "#FFF7E6",
        "#2D3A47",
        "#4A5B6D",
        "#B46A72",
        "#F7C8D3",
        "#A8B58A",
        "#A9B7C6",
        "#141B22",
        "Plus Jakarta Sans",
        "Inter",
        "JetBrains Mono",
      ],
    });
  }

  const skillCount = await c.execute("SELECT COUNT(*) as c FROM skills");
  if ((skillCount.rows[0].c as number) === 0) {
    const rows: Array<[string, string, string]> = [
      ["Python", "languages", "Primary language for data and ML coursework."],
      ["Java", "languages", "Studied as part of the Information Systems curriculum."],
      ["JavaScript", "languages", "Drives every site in the project list."],
      ["TensorFlow", "ai", "TensorFlow Developer and Data & Deployment certificates."],
      ["Machine Learning", "ai", "Stanford ML, Math for ML, and the Bangkit Academy track."],
      ["Data Analytics", "ai", "Google Data Analytics; Associate Data Scientist, VSGA Digitalent."],
      ["HTML & CSS", "web", "Hand-written across four published sites."],
      ["Bootstrap", "web", "Used on the apartment and village sites."],
      ["GSAP", "web", "Scroll and reveal motion on the apartment site."],
      ["REST APIs", "web", "TMDB integration on the movie app."],
      ["Git & GitHub", "tools", "All projects are published from GitHub Pages."],
      ["Cybersecurity", "tools", "Google Cybersecurity certificate."],
    ];
    await c.batch(
      rows.map((r, i) => ({
        sql: "INSERT INTO skills (name, cluster, note, sort_order) VALUES (?, ?, ?, ?)",
        args: [r[0], r[1], r[2], i],
      }))
    );
  }

  const clusters: Array<[string, string, number]> = [
    ["languages", "Languages", 0],
    ["ai", "AI & ML", 1],
    ["web", "Web", 2],
    ["tools", "Tools", 3],
    ["mobile", "Mobile", 4],
    ["game", "Game", 5],
  ];
  await c.batch(
    clusters.map(([id, label, order]) => ({
      sql: "INSERT OR IGNORE INTO skill_clusters (id, label, visible, sort_order) VALUES (?, ?, 1, ?)",
      args: [id, label, order],
    }))
  );
}

// ── Public helpers ──────────────────────────────────────────────────

export async function dbGet<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = []
): Promise<T | undefined> {
  await ensureReady();
  const result = await client().execute({ sql, args });
  return result.rows[0] as T | undefined;
}

export async function dbAll<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = []
): Promise<T[]> {
  await ensureReady();
  const result = await client().execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function dbRun(
  sql: string,
  args: InValue[] = []
): Promise<{ changes: number; lastInsertRowid: bigint | undefined }> {
  await ensureReady();
  const result = await client().execute({ sql, args });
  return {
    changes: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid ?? undefined,
  };
}

export async function dbBatch(
  stmts: Array<{ sql: string; args?: InValue[] }>
): Promise<void> {
  await ensureReady();
  await client().batch(
    stmts.map((s) => ({ sql: s.sql, args: s.args ?? [] })),
    "deferred"
  );
}
