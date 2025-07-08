"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconDashboard,
  IconGalaxy,
  IconHelp,
  IconPhotoCircle,
  IconUpload,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Contact2Icon,
  GalleryHorizontal,
} from "lucide-react";
import { UserProfileSidebarLink } from "./UserProfileSidebarLink";
import { FiMail, FiMessageCircle, FiTool } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

export function SideBar({ children }: { children?: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  
  if (error) {
    console.error('SideNav: Auth error:', error);
  }
  
  // Show loading state while auth is initializing
  if (loading) {
    console.log('SideNav: Auth loading...');
  }

  const links = [
    {
      label: "Gallery",
      href: "/gallery",
      icon: <IconPhotoCircle className="h-6 w-6 shrink-0  text-blue-400" />,
    },
    ...(user
      ? [
          {
            label: "Saved Photos",
            href: "/saved-images",
            icon: (
              <Bookmark className="h-6 w-6 shrink-0 fill-blue-400 text-blue-400" />
            ),
          },
        ]
      : []),
    {
      label: "Generate Prompt",
      href: "/generate-prompt",
      icon: <IconGalaxy className="h-6 w-6 shrink-0  text-blue-400" />,
    },
    {
      label: "Request Feature",
      href: "/request-image",
      icon: <FiMessageCircle className="w-5 h-5 text-blue-400" />,
    },
    {
      label: "Contact Us",
      href: "/contact-us",
      icon: <FiMail className="w-5 h-5 text-blue-400" />,
    },
    {
      label: "Support and Help",
      href: "/support-help",
      icon: <IconHelp className="h-6 w-6 shrink-0  text-blue-400" />,
    },
    {
      label: "Feedback",
      href: "/feedback",
      icon: <FiTool className="w-5 h-5 text-blue-400" />,
    },
    ...(user?.isAdmin
      ? [
          {
            label: "Admin Dashboard",
            href: "/admin-dashboard",
            icon: <IconDashboard className="h-6 w-6 shrink-0  text-red-400" />,
          },
          {
            label: "Admin Upload",
            href: "/admin-gallery-upload",
            icon: <IconUpload className="h-6 w-6 shrink-0  text-red-400" />,
          },
          {
            label: "Manage Gallery",
            href: "/admin-gallery-manage",
            icon: (
              <GalleryHorizontal className="h-6 w-6 shrink-0 text-red-400" />
            ),
          },
          {
            label: "Manage Users",
            href: "/admin-users",
            icon: <Contact2Icon className="h-6 w-6 shrink-0 text-red-400" />,
          },
        ]
      : []),
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex h-screen w-full max-w-screen flex-1 flex-col overflow-hidden rounded-md border border-none  md:flex-row  bg-white/10 dark:bg-black/10 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl "
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
      <Dashboard>{children}</Dashboard>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text drop-shadow">
          Prompt Pallete
        </h2>
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
