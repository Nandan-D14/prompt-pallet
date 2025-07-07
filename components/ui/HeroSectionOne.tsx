"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";

export function HeroSectionOne() {
  return (
    <div className="relative mx-auto my-0 flex max-w-8xl flex-col items-center justify-center px-10">
      {/* Remove Navbar since we now have GlassyNavigation in layout */}
      {/* Floating elements for enhanced visual appeal */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl animate-float animation-delay-4000"></div>
      <div className="px-4 py-20 md:py-32 relative z-10">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                      border border-white/20 dark:border-white/10
                      shadow-2xl shadow-black/10 dark:shadow-black/20
                      p-12 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-500/5 to-pink-500/5"></div>
          
          <div className="relative z-10">
            <h1 className="relative tracking-normal mx-auto max-w-7xl text-center text-4xl font-bold text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
              <motion.span
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"
              >
                Master Your Masterpieces
              </motion.span>
              <motion.span
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: "easeInOut",
                }}
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500"
              >
                In One Prompt
              </motion.span>
            </h1>
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.6,
              }}
              className="mx-auto max-w-4xl py-6 text-center text-xl font-normal text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              The ultimate home for your AI image prompts. Easily store and access
              your best commands to consistently generate amazing art. Your
              creativity, supercharged.
            </motion.p>
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.9,
              }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6"
            >
              <button
                className="liquid-btn px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 text-white font-semibold 
                         rounded-2xl shadow-2xl hover:scale-105 hover:shadow-blue-500/25 
                         transition-all duration-300 min-w-[200px]"
                onClick={() => {
                  window.location.href = "/gallery";
                }}
              >
                Explore Gallery
              </button>
              <button 
                className="px-8 py-4 bg-white/10 dark:bg-black/10 backdrop-blur-xl
                         border border-white/20 dark:border-white/10
                         hover:bg-white/20 dark:hover:bg-black/20 
                         text-gray-900 dark:text-white font-semibold rounded-2xl 
                         transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl
                         min-w-[200px]"
                onClick={() => {
                  window.location.href = "/contact-support";
                }}
              >
                Contact Support
              </button>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 1.2,
              }}
              className="mt-16 bg-white/10 dark:bg-black/10 backdrop-blur-xl 
                       border border-white/20 dark:border-white/10
                       rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500"
            >
              <AnimatePresence>
                <div className="w-full overflow-hidden rounded-2xl border border-white/20 dark:border-white/10">
                  <img
                    src="https://claid.ai/static/7f4415137e646985ded662bebb8fd248/ef08a/How_write_Prompts_f2b3eb0a8a.webp"
                    alt="AI prompt examples showcase"
                    className="aspect-[16/9] h-auto w-full object-cover transition-transform duration-500 hover:scale-110"
                    height={1000}
                    width={1000}
                  />
                </div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Navbar = () => {
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

  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-green-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">Prompt Palette</h1>
      </div>
      {loading ? (
        <div className="w-24 md:w-32 h-10 bg-gray-300 animate-pulse rounded-lg"></div>
      ) : user ? (
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <button
              className="hidden sm:block transform rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700"
              onClick={() => {
                window.location.href = "/admin-gallery-upload";
              }}
            >
              Admin
            </button>
          )}
          <button
            className="transform rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
            onClick={() => {
              window.location.href = "/profile";
            }}
          >
            Profile
          </button>
        </div>
      ) : (
        <button
          className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          onClick={() => {
            window.location.href = "/sign-in";
          }}
        >
          Login
        </button>
      )}
    </nav>
  );
};
