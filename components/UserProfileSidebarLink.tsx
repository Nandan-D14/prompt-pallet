"use client";
import React from "react";
import { SidebarLink } from "./ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function UserProfileSidebarLink() {
  const { user, loading, error } = useAuth();
  
  console.log('UserProfileSidebarLink render:', { user: !!user, loading, error });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      window.location.href = "/profile";
    } else {
      window.location.href = "/sign-in";
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <SidebarLink
        link={{
          label: "Loading...",
          href: "#",
          icon: (
            <div className="h-7 w-7 shrink-0 rounded-full bg-gray-300 animate-pulse" />
          ),
        }}
      />
    );
  }

  return (
    <SidebarLink
      link={{
        label: user ? user.name || "Profile" : "Sign In",
        href: user ? "/profile" : "/sign-in",
        icon: (
          <img
            src={user?.avatarUrl || "/profile-avatar.png"}
            className="h-7 w-7 shrink-0 rounded-full"
            width={80}
            height={80}
            alt="Avatar"
          />
        ),
      }}
    />
  );
}
