import { Nav } from "@/components/Nav";
import { CanvasHero } from "@/components/CanvasHero";
import { MissionLine } from "@/components/MissionLine";
import { LanyardSection } from "@/components/LanyardSection";
import { MembersGrid } from "@/components/MembersGrid";
import { EventsList } from "@/components/EventsList";
import { LibraryGrid } from "@/components/LibraryGrid";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <CanvasHero />
        <MissionLine />
        <LanyardSection />
        <MembersGrid />
        <EventsList />
        <LibraryGrid />
      </main>
      <Footer />
    </>
  );
}
