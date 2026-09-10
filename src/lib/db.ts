import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "portfolio.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

declare global {
  var __portfolioDb: Database.Database | undefined;
}

function open(): Database.Database {
  if (global.__portfolioDb) return global.__portfolioDb;
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  init(db);
  migrate(db);
  seed(db);
  global.__portfolioDb = db;
  return db;
}

// SQLite can't ALTER CHECK constraints, so widening the allowed values for
// `timeline.kind` and `skills.cluster` means rebuilding the table. Runs after
// init() (which creates the target-shape tables with CREATE IF NOT EXISTS —
// a no-op when an old-shape table already exists) and before seed().
function migrate(db: Database.Database) {
  const tl = db
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='timeline'`)
    .get() as { sql: string } | undefined;
  if (tl && !tl.sql.includes("'other'")) {
    db.exec(`
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

  const sk = db
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='skills'`)
    .get() as { sql: string } | undefined;
  if (
    sk &&
    (!sk.sql.includes("'mobile'") ||
      !sk.sql.includes("'game'") ||
      !sk.sql.includes("'ai'"))
  ) {
    db.exec(`
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

function init(db: Database.Database) {
  db.exec(`
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

function seed(db: Database.Database) {
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (userCount.c === 0) {
    const email = process.env.ADMIN_EMAIL || "nabilaramadhanty11@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "changeme-nara-2026";
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, hash);
    console.log(`[db] Seeded admin user: ${email}`);
  }

  const idCount = db.prepare("SELECT COUNT(*) as c FROM identity").get() as { c: number };
  if (idCount.c === 0) {
    db.prepare(`
      INSERT INTO identity (id, name, role, location, email, linkedin, github, github_user, cv, portrait)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Nabila Ramadhanty",
      "Web Developer",
      "Makassar, Indonesia",
      "nabilaramadhanty11@gmail.com",
      "https://www.linkedin.com/in/nabilaramadhanty12/",
      "https://github.com/nara101",
      "nara101",
      "/pdf/Nabila Ramadhanty (2).pdf",
      "/images/nara2.jpg"
    );
  }

  const aboutCount = db.prepare("SELECT COUNT(*) as c FROM about").get() as { c: number };
  if (aboutCount.c === 0) {
    db.prepare("INSERT INTO about (id, lede, body_json) VALUES (1, ?, ?)").run(
      "A creative, hardworking person who is enthusiastic about learning new things — especially where art, science and technology meet.",
      JSON.stringify([
        "I have leadership experience and I'm comfortable leading a team. Reading and writing are my hobbies. I know and am still learning several programming languages, including Python and Java.",
        "I'm currently studying Information Systems at Hasanuddin University in Makassar.",
      ])
    );
  }

  const tlCount = db.prepare("SELECT COUNT(*) as c FROM timeline").get() as { c: number };
  if (tlCount.c === 0) {
    const insert = db.prepare(
      "INSERT INTO timeline (period, title, detail, kind, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
    const rows = [
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
    rows.forEach((r, i) => insert.run(r[0], r[1], r[2], r[3], i));
  }

  const certCount = db.prepare("SELECT COUNT(*) as c FROM certificates").get() as { c: number };
  if (certCount.c === 0) {
    const insert = db.prepare(
      "INSERT INTO certificates (title, issuer, file, year, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
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
    rows.forEach((r, i) => insert.run(r[0], r[1], r[2], r[3], i));
  }

  const projCount = db.prepare("SELECT COUNT(*) as c FROM projects").get() as { c: number };
  if (projCount.c === 0) {
    const insert = db.prepare(`
      INSERT INTO projects (slug, name, tagline, description, live_url, repo_url, stack_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
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
    rows.forEach((p, i) =>
      insert.run(p.slug, p.name, p.tagline, p.description, p.liveUrl, p.repoUrl, JSON.stringify(p.stack), i)
    );
  }

  const themeCount = db.prepare("SELECT COUNT(*) as c FROM theme").get() as { c: number };
  if (themeCount.c === 0) {
    db.prepare(`
      INSERT INTO theme (id, color_bg, color_text, color_text_muted, color_accent, color_accent_soft, color_accent_nature, color_accent_sky, color_ink_dark, font_display, font_body, font_mono)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "#FFF7E6", // bg (Vanilla Cream)
      "#2D3A47", // text (Midnight Lagoon)
      "#4A5B6D", // text muted
      "#B46A72", // accent (Rosewood)
      "#F7C8D3", // accent soft (Blush Petal)
      "#A8B58A", // accent nature (Sage Leaf)
      "#A9B7C6", // accent sky (Misty Sky)
      "#141B22", // ink dark
      "Plus Jakarta Sans",
      "Inter",
      "JetBrains Mono"
    );
  }

  const skillCount = db.prepare("SELECT COUNT(*) as c FROM skills").get() as { c: number };
  if (skillCount.c === 0) {
    const insert = db.prepare(
      "INSERT INTO skills (name, cluster, note, sort_order) VALUES (?, ?, ?, ?)"
    );
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
    rows.forEach((r, i) => insert.run(r[0], r[1], r[2], i));
  }

  // Seed the 6 cluster metadata rows (labels shown in the constellation legend,
  // plus a visibility toggle per cluster). Rows are ADDED per-cluster if
  // missing so upgrades from an earlier 4-cluster DB pick up mobile+game.
  const clusters: Array<[string, string, number]> = [
    ["languages", "Languages", 0],
    ["ai", "AI & ML", 1],
    ["web", "Web", 2],
    ["tools", "Tools", 3],
    ["mobile", "Mobile", 4],
    ["game", "Game", 5],
  ];
  const insertCluster = db.prepare(
    "INSERT OR IGNORE INTO skill_clusters (id, label, visible, sort_order) VALUES (?, ?, 1, ?)"
  );
  for (const [id, label, order] of clusters) insertCluster.run(id, label, order);
}

export const db = open;
