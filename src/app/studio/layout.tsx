import type { Metadata } from "next";
import { getTheme } from "@/lib/content";
import { themeStyleString, googleFontsHref } from "@/lib/theme";
import "./studio.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={googleFontsHref(theme)} />
      <style dangerouslySetInnerHTML={{ __html: themeStyleString(theme) }} />
      <div className="studio-root">{children}</div>
    </>
  );
}
