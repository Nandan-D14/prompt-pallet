"use client";

import React from 'react';
import { FiBook } from "react-icons/fi";

export default function APIDocs() {
  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-3xl text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-500 to-yellow-400 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Explore our APIs and integrate AI capabilities into your projects.
          </p>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="max-w-4xl mx-auto">
        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Getting Started</h2>
          <p className="text-gray-300 mb-4">
            Our API allows developers to generate creative AI image prompts. You can start by obtaining your API key from your profile settings. Use the endpoint below to generate prompts.
          </p>
          <pre className="bg-black/10 rounded-xl p-4 text-sm text-gray-200 overflow-auto">
            {`POST /api/generate-image-prompt
            
            Headers:
            Content-Type: application/json
            Authorization: Bearer YOUR_API_KEY
            
            Body:
            {
              "description": "A vibrant sunset over a forest",
              "style": "artistic",
              "mood": "peaceful"
            {'}'}`}
          </pre>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Authentication</h2>
          <p className="text-gray-300 mb-4">
            Authentication requires a Bearer token in the Authorization header. Tokens can be generated from your account settings.
          </p>
        </section>

        <section className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">API Endpoints</h2>
          <ul className="text-gray-300 list-disc list-inside">
            <li><strong>/api/generate-image-prompt</strong> - Generate a new image prompt</li>
            <li><strong>/api/request-image</strong> - Submit a request for a new image</li>
            <li><strong>/api/feedback</strong> - Provide feedback to our team</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

