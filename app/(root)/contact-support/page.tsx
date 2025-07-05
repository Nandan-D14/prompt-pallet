import React from 'react';

const Page = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-2xl rounded-3xl max-w-2xl w-full p-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500 mb-2 text-center">
                    Contact & Support
                </h1>
                <p className="text-gray-700 text-center mb-8">
                    We value your feedback and are here to help! Please fill out the form below and our team will get back to you as soon as possible.
                </p>
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
                            rows={5}
                            placeholder="How can we help you?"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:from-pink-500 hover:to-blue-600 transition-all duration-300"
                    >
                        Send Message
                    </button>
                </form>
                <div className="mt-8 text-center text-gray-500 text-sm space-y-2">
                    <div>
                        Or email us directly at{' '}
                        <a href="mailto:support@promptpalette.com" className="text-blue-600 underline">
                            support@promptpalette.com
                        </a>
                    </div>
                    <div>
                        Visit our website:{' '}
                        <a href="https://promptpalette.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 underline">
                            promptpalette.com
                        </a>
                    </div>
                    <div>
                        Developed by{' '}
                        <a href="https://github.com/nandaprompt" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Nanda Kumar
                        </a>
                    </div>
                    <div>
                        Follow us on{' '}
                        <a href="https://twitter.com/promptpalette" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                            Twitter
                        </a>
                        {' '}|{' '}
                        <a href="https://github.com/promptpalette" target="_blank" rel="noopener noreferrer" className="text-gray-700 underline">
                            GitHub
                        </a>
                    </div>
                </div>
                <div className="mt-4 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Prompt Palette. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Page;