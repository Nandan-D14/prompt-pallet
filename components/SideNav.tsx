"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconArrowLeft,
  IconPhotoAi,
  IconStar,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Bookmark, Contact, Contact2Icon, ContactRoundIcon } from "lucide-react";
import { UserProfileSidebarLink } from "./UserProfileSidebarLink";

export function SideBar ({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    
    // Listen for auth changes and refetch user
    const { auth } = require("@/firebase/client");
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchUser();
    });
    
    // Listen for user data updates from other components
    const handleUserDataUpdated = (event: CustomEvent) => {
      setUser(event.detail);
    };
    
    window.addEventListener('userDataUpdated', handleUserDataUpdated as EventListener);
    
    return () => {
      unsubscribe();
      window.removeEventListener('userDataUpdated', handleUserDataUpdated as EventListener);
    };
  }, []);

  const links = [
    {
      label: "Gallery",
      href: "/gallery",
      icon: (
        <IconPhotoAi className="h-6 w-6 shrink-0  text-blue-400" />
      ),
    },
    ...(user ? [{
      label: "Saved Photos",
      href: "/saved-images",
      icon: (
        <Bookmark className="h-6 w-6 shrink-0 fill-blue-400 text-blue-400" />
      ),
    }] : []),
    {
      label: "Generate Prompt",
      href: "/generate-prompt",
      icon: (
        <IconStar className="h-6 w-6 shrink-0 fill-blue-400 text-blue-400" />
      ),
    },
    {
      label: "Contact and Support",
      href: "/contact-support",
      icon: (
        <ContactRoundIcon className="h-6 w-6 shrink-0 text-blue-400" />
      ),
    },
    ...(user?.isAdmin ? [
      {
        label: "Admin Upload",
        href: "/admin-gallery-upload",
        icon: (
          <IconPhotoAi className="h-6 w-6 shrink-0 fill-red-400 text-red-400" />
        ),
      },
      {
        label: "Manage Gallery",
        href: "/admin-gallery-manage",
        icon: (
          <IconPhotoAi className="h-6 w-6 shrink-0 fill-red-400 text-red-400" />
        ),
      }
    ] : [])
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex h-screen w-full max-w-screen flex-1 flex-col overflow-hidden rounded-md border border-none  md:flex-row bg-black/70"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col ">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <UserProfileSidebarLink />
        </SidebarBody>
      </Sidebar>
      <Dashboard>
        {children} 
      </Dashboard>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black/70 dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Prompt Pallete
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="flex h-auto w-full flex-1 flex-col gap-2 overflow-y-scroll rounded-tl-2xl border border-neutral-800 md:pt-15 bg-black/70">
        {children || (
          <div className="flex h-full w-full items-center justify-center">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              No Items Found !
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};
