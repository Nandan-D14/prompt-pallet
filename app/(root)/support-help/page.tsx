"use client";

import React, { useState } from 'react';
import { FiMail, FiMessageCircle, FiHelpCircle, FiBook, FiTool, FiSearch } from 'react-icons/fi';

export default function SupportHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqItems = [
    {
      question: "How do I generate AI image prompts?",
      answer: "Navigate to the 'Generate Prompt' page, enter your description, and our AI will create detailed prompts for image generation tools like Midjourney, DALL-E, or Stable Diffusion."
    },
    {
      question: "Can I save images to my profile?",
      answer: "Yes! You can like and save images from the gallery. All your saved images will be available in the 'Saved Images' section of your profile."
    },
    {
      question: "How do I upload images as an admin?",
      answer: "Admins can add images by providing image URLs in the admin upload section. Simply paste the image URL and fill in the metadata."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, Prompt Palette is a web-based application optimized for all devices including mobile browsers. We're considering a native mobile app for the future."
    },
    {
      question: "How do I request new features?",
      answer: "You can submit feature requests through our contact form or use the 'Request Image' feature in the sidebar to suggest new content."
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-3xl text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          
          <p className="text-gray-300 text-lg">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
            <div className="space-y-3">
              <a 
                href="/contact-support" 
                className="flex items-center space-x-3 p-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-300 border border-blue-500/30"
              >
                <FiMail className="w-5 h-5 text-blue-400" />
                <span>Contact Support</span>
              </a>
              <a 
                href="/request-image" 
                className="flex items-center space-x-3 p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-300 border border-purple-500/30"
              >
                <FiMessageCircle className="w-5 h-5 text-purple-400" />
                <span>Request Image</span>
              </a>
              <a 
                href="/api-docs" 
                className="flex items-center space-x-3 p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 transition-all duration-300 border border-green-500/30"
              >
                <FiBook className="w-5 h-5 text-green-400" />
                <span>API Documentation</span>
              </a>
              <a 
                href="/feedback" 
                className="flex items-center space-x-3 p-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 transition-all duration-300 border border-pink-500/30"
              >
                <FiTool className="w-5 h-5 text-pink-400" />
                <span>Submit Feedback</span>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Contact Information</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-blue-400" />
                <span>mr.myth1482005@gmail.com</span>
              </div>
              <div className="text-sm text-gray-400">
                We typically respond within 24 hours
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">Frequently Asked Questions</h2>
            
            {/* Search FAQ */}
            <div className="relative mb-6">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <details key={index} className="group">
                  <summary className="cursor-pointer p-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-black/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{item.question}</h3>
                      <FiHelpCircle className="w-5 h-5 text-blue-400 group-open:rotate-180 transition-transform duration-300" />
                    </div>
                  </summary>
                  <div className="mt-2 p-4 bg-black/10 backdrop-blur-xl border border-white/5 rounded-xl">
                    <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No FAQ items found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-white">Still Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact-us"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              Contact Support
            </a>
            <a
              href="/feedback"
              className="px-6 py-3 bg-black/80 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Submit Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
