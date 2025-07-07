"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/contexts/AuthContext';

function TestAuthContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">🎉 Authentication Test Successful!</h1>
          <p className="text-gray-300 mb-4">
            You are successfully authenticated with Firebase!
          </p>
          
          {user && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <h3 className="text-green-400 font-semibold mb-2">User Information:</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
          )}

          <div className="flex gap-4">
            <LogoutButton />
            <a
              href="/gallery"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go to Gallery
            </a>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">✅ Authentication Features Working:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• ✅ Email/Password Sign Up</li>
            <li>• ✅ Email/Password Sign In</li>
            <li>• ✅ Google Sign In</li>
            <li>• ✅ Password Reset</li>
            <li>• ✅ Route Protection</li>
            <li>• ✅ Auth State Management</li>
            <li>• ✅ Automatic Redirects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TestAuthPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAuth={true}>
        <TestAuthContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
