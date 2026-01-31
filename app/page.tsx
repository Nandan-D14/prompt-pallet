'use client';

import { HeroSectionOne } from "@/components/ui/HeroSectionOne";
import Footer from "@/components/ui/Footer";
import GlassyNavigation from "@/components/GlassyNavigation";
import WorkflowSection from "@/components/ui/WorkflowSection";

export default function Home() {
  return (
    <div className="flex flex-col overflow-auto w-full h-auto min-h-screen bg-black">
    <GlassyNavigation />
    <div className="min-h-screen w-full relative bg-black">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(236, 72, 153, 0.25), transparent 70%), #000000",
        }}
      />
      <HeroSectionOne />
      <WorkflowSection />
      <Footer />
    </div>
  </div>

  );
}
