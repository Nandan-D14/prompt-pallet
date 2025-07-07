"use client";
import React, { useEffect, useState } from "react";
import { SidebarLink } from "./ui/sidebar";

export function UserProfileSidebarLink() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: any;
    const fetchUser = async (firebaseUser: any) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/me", { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          
          // Enhance user data with Firebase user info if available
          const enhancedUserData = {
            ...data,
            // Use Google profile photo if no custom avatar is set
            avatarUrl: data.avatarUrl || (firebaseUser.photoURL && !data.avatarUrl ? firebaseUser.photoURL : data.avatarUrl) || '',
            // Use Firebase display name if no name is set
            name: data.name || firebaseUser.displayName || data.email?.split('@')[0] || 'User'
          };
          
          setUser(enhancedUserData);
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: enhancedUserData }));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    import("@/firebase/client").then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        fetchUser(firebaseUser);
      });
    });
    
    // Listen for user data updates from other components
    const handleUserDataUpdated = (event: CustomEvent) => {
      setUser(event.detail);
      setLoading(false);
    };
    
    window.addEventListener(
      "userDataUpdated",
      handleUserDataUpdated as EventListener
    );
    
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener(
        "userDataUpdated",
        handleUserDataUpdated as EventListener
      );
    };
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
