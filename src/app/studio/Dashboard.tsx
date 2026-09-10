"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdentityEditor from "./editors/IdentityEditor";
import AboutEditor from "./editors/AboutEditor";
import TimelineEditor from "./editors/TimelineEditor";
import CertificatesEditor from "./editors/CertificatesEditor";
import ProjectsEditor from "./editors/ProjectsEditor";
import SkillsEditor from "./editors/SkillsEditor";
import SkillClustersEditor from "./editors/SkillClustersEditor";
import TestimonialsEditor from "./editors/TestimonialsEditor";
import AchievementsEditor from "./editors/AchievementsEditor";
import AccountEditor from "./editors/AccountEditor";
import ThemeEditor from "./editors/ThemeEditor";

type Tab =
  | "identity"
  | "about"
  | "timeline"
  | "projects"
  | "skills"
  | "skill-clusters"
  | "certificates"
  | "testimonials"
  | "achievements"
  | "theme"
  | "account";

const TABS: { id: Tab; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "about", label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "skill-clusters", label: "Skill Clusters (visibility)" },
  { id: "certificates", label: "Certificates" },
  { id: "testimonials", label: "Testimonials" },
  { id: "achievements", label: "Achievements" },
  { id: "theme", label: "Theme (colors & fonts)" },
  { id: "account", label: "Account" },
];

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("identity");

  useEffect(() => {
    const h = (window.location.hash || "").replace("#", "");
    if (TABS.some((t) => t.id === h)) setTab(h as Tab);
  }, []);

  function go(id: Tab) {
    setTab(id);
    window.location.hash = id;
  }

  async function logout() {
    await fetch("/api/studio/auth/logout", { method: "POST" });
    router.push("/studio/login");
    router.refresh();
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <h1>Portfolio Studio</h1>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => go(t.id)}
          >
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/" target="_blank" rel="noreferrer">
          → View site
        </a>
        <button onClick={logout}>Sign out</button>
      </aside>

      <main className="studio-main">
        {tab === "identity" && <IdentityEditor />}
        {tab === "about" && <AboutEditor />}
        {tab === "timeline" && <TimelineEditor />}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "skills" && <SkillsEditor />}
        {tab === "skill-clusters" && <SkillClustersEditor />}
        {tab === "certificates" && <CertificatesEditor />}
        {tab === "testimonials" && <TestimonialsEditor />}
        {tab === "achievements" && <AchievementsEditor />}
        {tab === "theme" && <ThemeEditor />}
        {tab === "account" && <AccountEditor />}
      </main>
    </div>
  );
}
