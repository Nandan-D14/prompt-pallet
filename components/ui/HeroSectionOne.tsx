"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";

export function HeroSectionOne() {
  return (
    <div className="relative mx-auto my-5 flex max-w-450 flex-col items-center justify-center">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative tracking-normal z-10 mx-auto max-w-7xl text-center text-4xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          <motion.span
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              ease: "easeInOut",
            }}
            className="mr-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-pink-600 dark:from-green-500 dark:to-pink-800"
          >
            Master Your Masterpieces In One Prompt .
          </motion.span>
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-4xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          the ultimate home for your AI image prompts. Easily store and access
          your best commands to consistently generate amazing art. Your
          creativity, supercharged. up.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            onClick={() => {
              window.location.href = "/gallery";
            }}
          >
            Explore Now
          </button>
          <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
            Contact Support
          </button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <AnimatePresence>
            <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
              <img
                src="https://claid.ai/static/7f4415137e646985ded662bebb8fd248/ef08a/How_write_Prompts_f2b3eb0a8a.webp"
                alt="Landing page preview"
                className="aspect-[16/9] h-auto w-full object-cover"
                height={1000}
                width={1000}
              />
            </div>
          </AnimatePresence>
        </motion.div>
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
