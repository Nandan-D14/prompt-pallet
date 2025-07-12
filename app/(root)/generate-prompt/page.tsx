"use client";

import React, { useState } from "react";
import { geminiService } from '@/lib/gemini-service';

const EXAMPLES = [
  "Make the background sunset-themed without changing the person’s face.",
  "Change the color of the car, but keep the wheels and logo untouched.",
  "Add a hat to the dog, but do not alter its eyes or mouth.",
];

const AiPromptUI = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ user: string; ai?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setChat((prev) => [...prev, { user: prompt }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await geminiService.generatePrompt(prompt);

      if (response.success && response.prompt) {
        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].ai = response.prompt;
          return updated;
        });
      } else {
        setError(response.error || "Something went wrong. Please try again.");
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black/10 backdrop-blur-2xl text-white flex flex-col items-center px-4 pt-10 pb-24 relative overflow-hidden font-sans">
    
      <div className="mb-8 text-center max-w-xl">
        <div className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-pink-500 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
            AI Prompt Generator
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Transform simple ideas into stunning AI image prompts.
          </p>
        </div>
      </div>

      {/* Prompt History */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto space-y-6 p-4">
        {chat.map((entry, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-xl border border-white/20 text-white px-6 py-4 rounded-2xl shadow-xl">
                {entry.user}
              </div>
            </div>

            {entry.ai && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-black/10 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-2xl shadow-xl text-gray-100 whitespace-pre-line">
                  {entry.ai}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/10 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-2xl shadow-xl">
              <div className="text-blue-400 animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-400"></div>
                <span className="ml-2">Generating prompt...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl px-6 py-4 text-center shadow-xl">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="fixed bottom-6 w-full max-w-2xl px-4"
      >
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-2xl border border-white/20 px-6 py-4 rounded-2xl shadow-7xl">
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
            placeholder="Describe what you want to create (e.g., 'A futuristic city under a purple sky')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-blue-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl transition-all duration-300 font-medium shadow-lg hover:scale-105"
          >
            Generate
          </button>
        </div>
        {/* Example Prompts */}
        <div className="text-xs text-gray-400 mt-4 text-center">
          <span className="text-gray-500">Try: </span>
          {EXAMPLES.map((ex, i) => (
            <span
              key={i}
              onClick={() => setInput(ex)}
              className="underline cursor-pointer hover:text-blue-400 transition duration-200 mx-1"
            >
              "{ex}"
            </span>
          ))}
        </div>
      </form>
    </div>
  );
};

export default AiPromptUI;
