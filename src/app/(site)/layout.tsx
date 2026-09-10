import type { Metadata } from "next";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Aurora } from "@/components/ui/Aurora";
import { Cursor } from "@/components/ui/Cursor";
import { Loader } from "@/components/ui/Loader";
import { getIdentity, getTheme } from "@/lib/content";
import { themeStyleString, googleFontsHref } from "@/lib/theme";

// Layout reads the theme from the database on every request so a save in the
// studio is visible on the next page load without a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { name, role, location } = await getIdentity();
  return {
    metadataBase: new URL("https://nara101.github.io"),
    title: {
      default: `${name} — ${role}`,
      template: `%s — ${name}`,
    },
    description: `${name} is a ${role.toLowerCase()} and Information Systems student based in ${location}, working across web development, data and machine learning.`,
    openGraph: {
      title: `${name} — ${role}`,
      description: `Portfolio of ${name}.`,
      type: "profile",
      locale: "en_US",
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();
  const themeCss = themeStyleString(theme);
  const gfontHref = googleFontsHref(theme);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={gfontHref} />
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />

      <noscript>
        <style>{`
          [style*="opacity:0"], [style*="opacity: 0"] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            clip-path: none !important;
            height: auto !important;
          }
          .z-\\[10000\\] { display: none !important; }
        `}</style>
      </noscript>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-full focus:bg-blush-400 focus:px-5 focus:py-2.5 focus:font-medium focus:text-lagoon-50"
      >
        Skip to content
      </a>

      <Aurora />
      <Loader />
      <Cursor />

      <SmoothScroll>
        <main id="main" className="relative">
          {children}
        </main>
      </SmoothScroll>
    </>
  );
}
