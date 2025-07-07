"use client";

import React from 'react';
import { FiFileText } from "react-icons/fi";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-3xl text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Last updated: January 2025
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using Prompt Palette, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Permission is granted to temporarily use Prompt Palette for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="text-gray-300 list-disc list-inside space-y-2">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">3. User Content</h2>
          <p className="text-gray-300 leading-relaxed">
            Users are responsible for the content they submit, including prompts and images. By submitting content, you grant us a non-exclusive license to use, display, and distribute your content within the platform.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Privacy Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">5. Contact Information</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at: 
            <span className="text-blue-400 ml-1">mr.myth1482005@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
