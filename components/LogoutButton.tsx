"use client";

import { useAuth } from '@/contexts/AuthContext';

const LogoutButton = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
