'use client';

import { HeroSectionOne } from "@/components/ui/HeroSectionOne";
import Footer from "@/components/ui/Footer";
import GlassyNavigation from "@/components/GlassyNavigation";
import WorkflowSection from "@/components/ui/WorkflowSection";
import { useEffect } from "react";
import { checkAndMigrateData } from "@/lib/migrate-data";

export default function Home() {
  // Migrate data on app load
  useEffect(() => {
    const migrateData = async () => {
      try {
        const result = await checkAndMigrateData();
        console.log('Data migration result:', result);
      } catch (error) {
        console.error('Migration error:', error);
      }
    };
    migrateData();
  }, []);

  return (
    <div className="flex flex-col overflow-auto w-full h-auto min-h-screen bg-black">
      <div className="min-h-screen w-full relative bg-black">

      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(236, 72, 153, 0.25), transparent 70%), #000000",
        }}
      />
          <GlassyNavigation />
          <div className="pt-10">
            <HeroSectionOne />
            <WorkflowSection />
            <Footer />
          </div>
      </div>
    
  </div>  
  );
}
