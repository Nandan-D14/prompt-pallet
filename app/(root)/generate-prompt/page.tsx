"use client";
import React, { useState } from "react";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

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
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert prompt engineer for image editing. Given a simple user prompt, generate an advanced, detailed prompt for an AI image editor. Ensure the prompt includes instructions to avoid changing human faces or any specifically mentioned product or part. User prompt: "${prompt}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].ai = result;
        return updated;
      });
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-full bg-black/70 text-white flex flex-col items-center px-4 pt-10 pb-24 relative overflow-hidden font-sans">
      {/* Glowing Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[30rem] h-[30rem] bg-indigo-500 opacity-[0.08] rounded-full blur-3xl top-[-10%] left-[-10%]" />
        <div className="absolute w-[20rem] h-[20rem] bg-pink-500 opacity-[0.06] rounded-full blur-3xl bottom-[-10%] right-[-10%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050e] to-transparent z-[-1]" />
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text absolute top-[-7px] text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 drop-shadow-lg">
          AI Prompt Assistant
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Type a simple idea. Get a smart, image-safe prompt.
        </p>
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-4xl p-12 flex-1 overflow-y-auto space-y-6">
        {chat.map((entry, index) => (
          <div key={index} className="space-y-2">
            {/* User bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white px-4 py-3 rounded-xl shadow-md">
                {entry.user}
              </div>
            </div>

            {/* AI bubble */}
            {entry.ai && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl shadow-inner text-gray-100 whitespace-pre-line">
                  {entry.ai}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="text-gray-500 animate-pulse">Generating prompt...</div>
          </div>
        )}
        {error && <div className="text-red-400 text-center">{error}</div>}
      </div>

      {/* Input + Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="fixed bottom-6 w-full max-w-2xl px-4"
      >
        <div className="flex items-center gap-2 bg-[#1e1e25] border border-white/10 px-4 py-3 rounded-xl shadow-md">
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            placeholder="Describe an edit like 'Add rain in the background but keep face unchanged'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            Send
          </button>
        </div>
        {/* Examples */}
        <div className="text-xs text-gray-500 mt-3">
          Try:{" "}
          {EXAMPLES.map((ex, i) => (
            <span
              key={i}
              onClick={() => setInput(ex)}
              className="underline cursor-pointer hover:text-indigo-300 mr-2"
            >
              {ex}
            </span>
          ))}
        </div>
      </form>
    </div>
  );
};

export default AiPromptUI;
