"use client";

import React from 'react';
import { FiImage, FiEdit3, FiSave, FiShare2, FiUpload, FiZap } from 'react-icons/fi';
import { motion } from 'motion/react';

export default function WorkflowSection() {
  const features = [
    {
      icon: FiZap,
      title: "AI-Powered Generation",
      description: "Generate stunning AI image prompts with our advanced Gemini-powered prompt generator. Transform simple ideas into detailed, creative prompts."
    },
    {
      icon: FiImage,
      title: "Curated Gallery",
      description: "Explore a vast collection of high-quality images with detailed prompts. Find inspiration from trending content and popular creations."
    },
    {
      icon: FiSave,
      title: "Save & Organize",
      description: "Like and save your favorite images and prompts. Build your personal collection and access them anytime from your profile."
    },
    {
      icon: FiShare2,
      title: "Share & Collaborate",
      description: "Share your favorite prompts and images with the community. Discover what others are creating and get inspired."
    }
  ];

  const workflow = [
    {
      step: "01",
      title: "Browse Gallery",
      description: "Explore our curated collection of AI-generated images with their corresponding prompts",
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "02", 
      title: "Generate Prompts",
      description: "Use our AI assistant to create detailed prompts from your simple descriptions",
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "03",
      title: "Save Favorites", 
      description: "Like and save images and prompts that inspire you to build your personal collection",
      color: "from-green-500 to-emerald-500"
    },
    {
      step: "04",
      title: "Create & Share",
      description: "Use the prompts to generate images and share your creations with the community",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="relative py-20 px-4">
      {/* About Section */}
      <div className="max-w-7xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent mb-6">
            What is Prompt Palette?
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Prompt Palette is the ultimate platform for AI image enthusiasts. We provide a comprehensive suite of tools 
            to help you create, discover, and manage AI image prompts. Whether you're a beginner or an expert, our platform 
            makes it easy to generate stunning AI artwork.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 hover:scale-105 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-400 bg-clip-text text-transparent mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our streamlined workflow makes it easy to discover, create, and share AI image prompts. 
            Follow these simple steps to get started with your AI art journey.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {workflow.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 hover:scale-105 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4 text-center">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed text-center">{step.description}</p>
              </div>

              {/* Connector Line (except for last item) */}
              {index < workflow.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Creating?</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of AI artists who use Prompt Palette to create stunning artwork. 
              Start your journey today and discover the power of AI-generated art.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/gallery'}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Explore Gallery
              </button>
              <button
                onClick={() => window.location.href = '/generate-prompt'}
                className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300"
              >
                Generate Prompts
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-pink-500/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  );
}
