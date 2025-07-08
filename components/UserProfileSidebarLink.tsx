"use client";
import React from "react";
import { SidebarLink } from "./ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function UserProfileSidebarLink() {
  const { user, loading, error, firebaseUser, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  console.log('UserProfileSidebarLink render:', { user: !!user, loading, error });

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we have a Firebase user but no app user, try to refresh
    if (!user && firebaseUser && !loading) {
      console.log('UserProfileSidebarLink: Firebase user exists but no app user, refreshing...');
      await refreshUserData();
      // Give it a moment for the state to update
      setTimeout(() => {
        window.location.href = "/profile";
      }, 500);
    } else if (user) {
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
    <div onClick={handleClick}>
      <SidebarLink
        link={{
          label: user ? user.name || "Profile" : "Sign In",
          href: "#",
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
    </div>
  );
}
