"use client";
import React, { useEffect, useState } from "react";
import { SidebarLink } from "./ui/sidebar";

export function UserProfileSidebarLink() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Trigger a custom event to notify other components about user data update
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: data }));
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
    return () => unsubscribe();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      window.location.href = "/profile";
    } else {
      window.location.href = "/sign-in";
    }
  };

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
