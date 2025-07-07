"use client";

import { ReactNode } from "react";
import { SideBar } from "@/components/SideNav";
import Footer from "@/components/ui/Footer";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <SideBar>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </SideBar>
    </div>
  );
};

export default RootLayout;
