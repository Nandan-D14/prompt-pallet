"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Removed theme imports since we're using dark mode only
import { FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiImage, FiHome, FiShield } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  avatarUrl?: string;
}

export default function GlassyNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  // Dark mode only - no theme context needed

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include' // Include cookies for session authentication
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If response is not ok (like 401), user is not authenticated
          console.log('User not authenticated:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { 
        method: 'POST',
        credentials: 'include' // Include cookies for session
      });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Gallery', href: '/gallery', icon: FiImage },
    ...(user ? [
      { name: 'Generate', href: '/generate-prompt', icon: FiSettings },
      { name: 'Saved Images', href: '/saved-images', icon: FiImage },
      { name: 'Profile', href: '/profile', icon: FiUser },
      ...(user.isAdmin ? [{ name: 'Admin', href: '/admin-dashboard', icon: FiShield }] : [])
    ] : [])
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                        border border-white/20 dark:border-white/10
                        shadow-2xl shadow-black/10 dark:shadow-black/20
                        px-6 py-3">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Prompt Palette
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-2xl transition-all duration-300 
                              flex items-center space-x-2 group overflow-hidden
                              ${isActive 
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-400 dark:text-blue-300' 
                                : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
                              }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl"></div>
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="text-sm font-medium relative z-10">{item.name}</span>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-500/10 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 
                             text-red-500 transition-all duration-300"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                           text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 
                           transition-all duration-300 text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 lg:hidden">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                        border border-white/20 dark:border-white/10
                        shadow-2xl shadow-black/10 dark:shadow-black/20
                        px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Prompt Palette
            </Link>

            <div className="flex items-center space-x-3">
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-white/10 dark:bg-black/10 
                         hover:bg-white/20 dark:hover:bg-black/20 
                         transition-all duration-300"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-400 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10'
                                }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl 
                             text-red-500 hover:bg-red-500/10 transition-all duration-300 w-full"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 
                             bg-gradient-to-r from-blue-500 to-purple-600 
                             text-white rounded-2xl font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
