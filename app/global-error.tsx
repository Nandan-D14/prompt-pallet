'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-500 mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-white mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
