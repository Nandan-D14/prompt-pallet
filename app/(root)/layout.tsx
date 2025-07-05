"use client";

import { ReactNode } from "react";
import { SideBar } from "@/components/SideNav";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <SideBar>
        {children}
      </SideBar>
    </div>
  );
};

export default RootLayout;
