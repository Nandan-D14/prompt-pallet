"use client";

import React from 'react';
import { FiShield } from "react-icons/fi";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-3xl text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Last updated: January 2025
          </p>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We collect information you provide directly to us, such as when you create an account, submit prompts, or contact us for support.
          </p>
          <ul className="text-gray-300 list-disc list-inside space-y-2">
            <li>Account information (email, name)</li>
            <li>Generated prompts and saved images</li>
            <li>Usage data and preferences</li>
            <li>Communication with our support team</li>
          </ul>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="text-gray-300 list-disc list-inside space-y-2">
            <li>Provide and improve our services</li>
            <li>Generate AI-powered content</li>
            <li>Send updates about new features</li>
            <li>Respond to your questions and support requests</li>
          </ul>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
          <p className="text-gray-300 leading-relaxed">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
          <p className="text-gray-300 leading-relaxed">
            We may use third-party services like Google AI and Firebase for authentication and data storage. These services have their own privacy policies.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at: 
            <span className="text-blue-400 ml-1">mr.myth1482005@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
