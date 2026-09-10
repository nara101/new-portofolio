import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Journey } from "@/components/sections/Journey";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";
import { Certificates } from "@/components/sections/Certificates";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Ending } from "@/components/sections/Ending";
import { Nav } from "@/components/ui/Nav";
import { EasterEggs } from "@/components/ui/EasterEggs";
import { getAllContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { identity, about, timeline, projects, skills, skillClusters, certificates, testimonials } = getAllContent();

  return (
    <>
      <Nav />
      <EasterEggs name={identity.name} email={identity.email} />

      <Hero identity={identity} />
      <About about={about} identity={identity} />
      <Journey timeline={timeline} />
      <Skills skills={skills} skillClusters={skillClusters} />
      <Work projects={projects} />
      <Certificates certificates={certificates} />
      <Testimonials testimonials={testimonials} />
      <Contact identity={identity} />
      <Ending identity={identity} />
    </>
  );
}
