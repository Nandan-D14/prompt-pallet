"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiGithub,FiInstagram, FiMail,  FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async () => {
    if (!email) {
      setSubscribeMessage('Please enter your email');
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeMessage('Successfully subscribed!');
        setEmail('');
      } else {
        setSubscribeMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setSubscribeMessage('Network error occurred');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="relative mt-20 bg-black/80 backdrop-blur-2xl border-t border-white/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full filter blur-2xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <img src="./ppLog.png" alt="Logo" width={32} height={32} className="rounded-full" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                Prompt Palette
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ultimate platform for AI image prompt creation and gallery management. 
              Create, store, and share your best AI prompts with our community.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="https://github.com/nandan-d14" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FiGithub className="w-5 h-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/nandan-d14" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FiLinkedin className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com/masked_edits99" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                <FiInstagram className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com/__nandan__d14/" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                <FiMail className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/generate-prompt" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Generate Prompts
                </Link>
              </li>
              <li>
                <Link href="/saved-images" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Saved Images
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/support-help" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Support & Help
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
            <p className="text-gray-400 text-sm">
              Get the latest prompts and updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-xl 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent backdrop-blur-xl text-sm"
                />
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-pink-500 
                           text-white rounded-r-xl hover:from-blue-600 hover:to-red-700 
                           transition-all duration-300 text-sm font-medium disabled:opacity-50">
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscribeMessage && (
                <div className={`text-xs ${subscribeMessage.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage}
                </div>
              )}
              <p className="text-xs text-gray-500">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} Prompt Palette. created by NANDAN D </span>
              
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Changelog
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Status
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
