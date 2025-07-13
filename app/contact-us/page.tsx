'use client';

import React, { useState } from 'react';

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Message sent successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to send message'}`);
      }
    } catch (error) {
      setMessage('Error: Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/10 dark:bg-black/20 backdrop-blur-2xl flex items-center justify-center p-4 text-white">
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl max-w-2xl w-full p-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 mb-4 text-center drop-shadow">
          Contact Us
        </h1>
        <p className="text-gray-300 text-center mb-8">
          We value your feedback and are here to help! Please fill out the form below and our team will get back to you as soon as possible.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Message</label>
            <textarea
              name="message"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:ring-2 focus:ring-pink-500 outline-none"
              rows={5}
              placeholder="How can we help you?"
              required
            />
          </div>
          {message && (
            <div className={`p-3 rounded-lg text-center ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:from-pink-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {/* <div className="mt-10 text-center text-gray-400 text-sm space-y-3">
          <p>
            Or email us directly at{' '}
            <a href="mailto:support@promptpalette.com" className="text-blue-400 underline">
              support@promptpalette.com
            </a>
          </p>
          <p>
            Visit our website:{' '}
            <a href="https://promptpalette.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">
              promptpalette.com
            </a>
          </p>
          <p>
            Developed by{' '}
            <a href="https://github.com/nandaprompt" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
              Nanda Kumar
            </a>
          </p>
          <p>
            Follow us on{' '}
            <a href="https://twitter.com/promptpalette" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              Twitter
            </a>
            {' '}|{' '}
            <a href="https://github.com/promptpalette" target="_blank" rel="noopener noreferrer" className="text-gray-300 underline">
              GitHub
            </a>
          </p>
        </div> */}

        <div className="mt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Prompt Palette. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Page;
