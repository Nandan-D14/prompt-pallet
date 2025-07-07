"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 
                 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl
                 border border-white/20 dark:border-black/20
                 hover:bg-white/20 dark:hover:bg-black/20
                 transition-all duration-300 ease-in-out
                 hover:scale-110 active:scale-95
                 shadow-lg shadow-black/10 dark:shadow-white/5
                 group overflow-hidden"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon container */}
      <div className="relative z-10 flex items-center justify-center">
        {theme === 'light' ? (
          <FiMoon 
            className="w-5 h-5 text-gray-700 dark:text-gray-300 
                       transition-all duration-300 transform group-hover:rotate-12" 
          />
        ) : (
          <FiSun 
            className="w-5 h-5 text-yellow-500 dark:text-yellow-400 
                       transition-all duration-300 transform group-hover:rotate-12" 
          />
        )}
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                      transition-transform duration-700 ease-out"></div>
    </button>
  );
}
