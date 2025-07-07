"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // First check server-side admin status
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const userData = await res.json();
          if (userData?.isAdmin) {
            setIsAdmin(true);
            setCheckingAuth(false);
            return;
          }
        }
        
        // Fallback to client-side check
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            router.replace("/sign-in");
            return;
          }
          
          // Check admin by email (or use custom claims if set up)
          if (ADMIN_EMAILS.includes(user.email || "")) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.replace("/");
          }
          setCheckingAuth(false);
        });
        return () => unsub();
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setCheckingAuth(false);
        router.replace("/");
      }
    };
    
    checkAdminStatus();
  }, [router]);

  // Fetch users when component mounts
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(`Error fetching users: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center text-white mt-10">Checking admin access...</div>;
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl min-h-screen mx-auto p-8 bg-black/80 rounded-xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Admin: User Management</h2>
        <button 
          onClick={() => router.push('/admin-dashboard')} 
          className="bg-blue-600 text-white py-2 px-4 rounded font-bold hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
      
      {success && <div className="bg-green-600/80 text-white p-4 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-600/80 text-white p-4 rounded mb-4">{error}</div>}
      
      <div className="bg-neutral-900/80 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
        <p className="text-neutral-400 mb-6">
          This feature is coming soon. You will be able to view, manage, and assign roles to users.
        </p>
        
        {loading ? (
          <div className="text-center text-neutral-300 my-8">Loading users...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-neutral-200">
              <thead className="text-xs uppercase bg-neutral-800 text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/70 transition">
                    <td className="px-4 py-3">{user.name || 'No name'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.isAdmin ? (
                        <span className="bg-red-600/30 text-red-300 px-2 py-1 rounded-full text-xs">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded-full text-xs">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        className="bg-neutral-700 text-white px-3 py-1 rounded text-sm hover:bg-neutral-600 transition"
                        disabled
                      >
                        Edit (Coming Soon)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-neutral-300 my-8">
            No users found or feature not yet implemented.
          </div>
        )}
      </div>
    </div>
  );
}